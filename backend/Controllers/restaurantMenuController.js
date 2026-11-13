const RestaurantMenu = require('../Models/RestaurantMenu');
const RestaurantCategory = require('../Models/RestaurantCategory');
const path = require('path');
const fs = require('fs');

const DEFAULT_CATEGORIES = [
  { name: 'Desi', description: 'Traditional Pakistani & South Asian specialties', color: '#fd7e14', icon: 'ri-bowl-line', isDefault: true },
  { name: 'Italian', description: 'Pastas, pizzas, risottos and continental dishes', color: '#0dcaf0', icon: 'ri-restaurant-line', isDefault: true },
  { name: 'Chinese', description: 'Wok specialties, noodles, and Asian flavors', color: '#d63384', icon: 'ri-cup-line', isDefault: true },
  { name: 'FastFood', description: 'Burgers, sandwiches, fries, and quick bites', color: '#198754', icon: 'ri-takeaway-line', isDefault: true },
];

const ensureDefaultCategories = async () => {
  try {
    const count = await RestaurantCategory.countDocuments();
    if (count === 0) {
      await RestaurantCategory.insertMany(DEFAULT_CATEGORIES);
    }
    // Discover any categories already existing in RestaurantMenu that aren't in RestaurantCategory
    const existingMenuCats = await RestaurantMenu.distinct('category');
    for (const catName of existingMenuCats) {
      if (catName && typeof catName === 'string' && catName.trim()) {
        const clean = catName.trim();
        const found = await RestaurantCategory.findOne({ name: new RegExp(`^${clean}$`, 'i') });
        if (!found) {
          await RestaurantCategory.create({
            name: clean,
            description: `${clean} menu items`,
            color: '#1B365D',
            icon: 'ri-restaurant-2-line',
            isDefault: false,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Category sync warning:', err.message);
  }
};

const getCategories = async (req, res) => {
  try {
    await ensureDefaultCategories();
    const categories = await RestaurantCategory.find().sort({ isDefault: -1, name: 1 });

    // Attach item counts
    const counts = await RestaurantMenu.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => {
      if (c._id) countMap[String(c._id).toLowerCase()] = c.count;
    });

    const data = categories.map(cat => ({
      ...cat.toObject(),
      itemCount: countMap[cat.name.toLowerCase()] || 0,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const cleanName = name.trim();
    const existing = await RestaurantCategory.findOne({
      name: new RegExp(`^${cleanName}$`, 'i')
    });
    if (existing) {
      return res.status(400).json({ success: false, message: `Category "${cleanName}" already exists` });
    }

    const cat = await RestaurantCategory.create({
      name: cleanName,
      description: description?.trim() || '',
      color: color || '#1B365D',
      icon: icon || 'ri-restaurant-2-line',
      isDefault: false,
    });

    res.status(201).json({ success: true, message: 'Category created successfully', data: cat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const cat = await RestaurantCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    const oldName = cat.name;
    if (name && name.trim()) {
      const cleanName = name.trim();
      if (cleanName.toLowerCase() !== oldName.toLowerCase()) {
        const duplicate = await RestaurantCategory.findOne({
          _id: { $ne: cat._id },
          name: new RegExp(`^${cleanName}$`, 'i')
        });
        if (duplicate) {
          return res.status(400).json({ success: false, message: `Category "${cleanName}" already exists` });
        }
        // Cascade update to existing menu items
        await RestaurantMenu.updateMany({ category: oldName }, { category: cleanName });
      }
      cat.name = cleanName;
    }
    if (description !== undefined) cat.description = description.trim();
    if (color) cat.color = color;
    if (icon) cat.icon = icon;

    await cat.save();
    res.status(200).json({ success: true, message: 'Category updated', data: cat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const cat = await RestaurantCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    // Check if in use
    const inUseCount = await RestaurantMenu.countDocuments({ category: cat.name });
    if (inUseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete "${cat.name}" because ${inUseCount} dish(es) are assigned to it. Please reassign or delete those items first.`
      });
    }

    await RestaurantCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addMenuItem = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.category) {
      data.category = data.category.trim();
      const catExists = await RestaurantCategory.findOne({ name: new RegExp(`^${data.category}$`, 'i') });
      if (!catExists) {
        await RestaurantCategory.create({
          name: data.category,
          description: `${data.category} menu items`,
          color: '#1B365D',
          icon: 'ri-restaurant-2-line',
          isDefault: false,
        });
      }
    }
    if (req.file) {
      data.image = `/Uploads/${req.file.filename}`;
    }
    const item = await RestaurantMenu.create(data);
    res.status(201).json({ success: true, message: 'Menu item added', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMenu = async (req, res) => {
  try {
    const menu = await RestaurantMenu.find().sort({ category: 1, name: 1 });
    res.status(200).json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMenuByCategory = async (req, res) => {
  try {
    const items = await RestaurantMenu.find({ category: req.params.category });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.category) {
      data.category = data.category.trim();
      const catExists = await RestaurantCategory.findOne({ name: new RegExp(`^${data.category}$`, 'i') });
      if (!catExists) {
        await RestaurantCategory.create({
          name: data.category,
          description: `${data.category} menu items`,
          color: '#1B365D',
          icon: 'ri-restaurant-2-line',
          isDefault: false,
        });
      }
    }

    if (req.file) {
      const oldItem = await RestaurantMenu.findById(req.params.id);
      if (oldItem?.image && oldItem.image.startsWith('/Uploads/')) {
        const oldPath = path.join(__dirname, '..', oldItem.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.image = `/Uploads/${req.file.filename}`;
    }

    const item = await RestaurantMenu.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(200).json({ success: true, message: 'Menu updated', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const item = await RestaurantMenu.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.image && item.image.startsWith('/Uploads/')) {
      const imgPath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    res.status(200).json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addMenuItem,
  getMenu,
  getMenuByCategory,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

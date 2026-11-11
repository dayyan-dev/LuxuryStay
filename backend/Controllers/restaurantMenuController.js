const RestaurantMenu = require('../Models/RestaurantMenu');
const path = require('path');
const fs = require('fs');

const addMenuItem = async (req, res) => {
  try {
    const data = { ...req.body };
    // Image upload handle karo
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

    // Nai image upload hoi hai to purani delete karo
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

    // Image bhi delete karo
    if (item.image && item.image.startsWith('/Uploads/')) {
      const imgPath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    res.status(200).json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addMenuItem, getMenu, getMenuByCategory, updateMenuItem, deleteMenuItem };
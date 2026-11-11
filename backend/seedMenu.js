require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');
const path = require('path');
 
const uploadsDir = path.join(__dirname, 'Uploads');
 
const imageUrls = {
  // Desi
  'biryani.jpg': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
  'karahi.jpg': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
  'nihari.jpg': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  'seekh-kebab.jpg': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80',
  'dal-chawal.jpg': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
  'haleem.jpg': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80',
  // Italian
  'margherita-pizza.jpg': 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&q=80',
  'pasta-alfredo.jpg': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&q=80',
  'lasagna.jpg': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80',
  'bruschetta.jpg': 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80',
  'risotto.jpg': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80',
  'tiramisu.jpg': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
  // Chinese
  'fried-rice.jpg': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
  'chow-mein.jpg': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
  'manchurian.jpg': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=600&q=80',
  'hot-sour-soup.jpg': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
  'spring-rolls.jpg': 'https://images.unsplash.com/photo-1548507200-e9457950e5cc?w=600&q=80',
  'sweet-sour-chicken.jpg': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80',
  // FastFood
  'beef-burger.jpg': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  'club-sandwich.jpg': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80',
  'loaded-fries.jpg': 'https://images.unsplash.com/photo-1630384060421-cb20aeb68713?w=600&q=80',
  'chicken-wings.jpg': 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80',
  'chicken-wrap.jpg': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80',
  'milkshake.jpg': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80',
};
 
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      console.log(`Already exists: ${filename}`);
      return resolve();
    }
    console.log(`Downloading: ${filename}...`);
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (res2) => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); console.log(`Downloaded: ${filename}`); resolve(); });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); console.log(`Downloaded: ${filename}`); resolve(); });
      }
    }).on('error', reject);
  });
}
 
async function seed() {
  try {
    // Step 1: Download images
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    console.log('Downloading menu images...\n');
    for (const [filename, url] of Object.entries(imageUrls)) {
      await downloadImage(url, filename);
    }
    console.log('\nAll images downloaded!\n');
 
    // Step 2: Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB!');
    const db = mongoose.connection.db;
 
    const existing = await db.collection('menus').countDocuments();
    if (existing > 0) {
      console.log(`Already ${existing} menu items exist. Delete them first to re-seed.`);
      process.exit(0);
    }
 
    // Step 3: Seed menu items
    const menuItems = [
      // ============ DESI ============
      { name: 'Chicken Biryani', description: 'Aromatic basmati rice layered with tender spiced chicken, saffron, and fried onions. Served with raita.', price: 650, category: 'Desi', image: '/Uploads/biryani.jpg', isAvailable: true, dietaryTags: ['spicy', 'non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chicken Karahi', description: 'Succulent chicken cooked in a wok with fresh tomatoes, green chilies, and aromatic spices. Served with naan.', price: 1200, category: 'Desi', image: '/Uploads/karahi.jpg', isAvailable: true, dietaryTags: ['spicy', 'non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Nihari', description: 'Slow-cooked beef stew simmered overnight with traditional spices. Garnished with ginger and coriander.', price: 800, category: 'Desi', image: '/Uploads/nihari.jpg', isAvailable: true, dietaryTags: ['spicy', 'non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Seekh Kebab', description: 'Juicy minced beef kebabs grilled on skewers with herbs and spices. Served with mint chutney and naan.', price: 550, category: 'Desi', image: '/Uploads/seekh-kebab.jpg', isAvailable: true, dietaryTags: ['non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Dal Chawal', description: 'Creamy yellow lentils tempered with cumin and garlic, served with steamed basmati rice and pickle.', price: 400, category: 'Desi', image: '/Uploads/dal-chawal.jpg', isAvailable: true, dietaryTags: ['veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Haleem', description: 'Rich and thick blend of wheat, lentils, and slow-cooked beef with warming spices. Topped with crispy onions.', price: 700, category: 'Desi', image: '/Uploads/haleem.jpg', isAvailable: true, dietaryTags: ['spicy', 'non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
 
      // ============ ITALIAN ============
      { name: 'Margherita Pizza', description: 'Classic thin-crust pizza with fresh mozzarella, San Marzano tomato sauce, and fragrant basil leaves.', price: 950, category: 'Italian', image: '/Uploads/margherita-pizza.jpg', isAvailable: true, dietaryTags: ['veg'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chicken Alfredo Pasta', description: 'Creamy fettuccine pasta tossed with grilled chicken, parmesan cheese, and a rich garlic cream sauce.', price: 850, category: 'Italian', image: '/Uploads/pasta-alfredo.jpg', isAvailable: true, dietaryTags: ['non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Beef Lasagna', description: 'Layers of pasta sheets, seasoned beef, ricotta cheese, and marinara sauce baked to perfection.', price: 1100, category: 'Italian', image: '/Uploads/lasagna.jpg', isAvailable: true, dietaryTags: ['non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bruschetta', description: 'Toasted Italian bread topped with fresh diced tomatoes, basil, garlic, and a drizzle of olive oil.', price: 450, category: 'Italian', image: '/Uploads/bruschetta.jpg', isAvailable: true, dietaryTags: ['veg'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mushroom Risotto', description: 'Creamy Arborio rice slowly cooked with wild mushrooms, parmesan, and a touch of white wine.', price: 900, category: 'Italian', image: '/Uploads/risotto.jpg', isAvailable: true, dietaryTags: ['veg'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tiramisu', description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream dusted with cocoa.', price: 550, category: 'Italian', image: '/Uploads/tiramisu.jpg', isAvailable: true, dietaryTags: ['veg'], createdAt: new Date(), updatedAt: new Date() },
 
      // ============ CHINESE ============
      { name: 'Chicken Fried Rice', description: 'Wok-tossed basmati rice with chicken, eggs, vegetables, soy sauce, and spring onions.', price: 600, category: 'Chinese', image: '/Uploads/fried-rice.jpg', isAvailable: true, dietaryTags: ['non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chicken Chow Mein', description: 'Stir-fried egg noodles with chicken strips, bell peppers, cabbage, and savory soy sauce.', price: 650, category: 'Chinese', image: '/Uploads/chow-mein.jpg', isAvailable: true, dietaryTags: ['non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chicken Manchurian', description: 'Crispy chicken balls tossed in a tangy, sweet, and spicy Manchurian sauce with spring onions.', price: 750, category: 'Chinese', image: '/Uploads/manchurian.jpg', isAvailable: true, dietaryTags: ['spicy', 'non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Hot & Sour Soup', description: 'A warming soup with chicken, tofu, mushrooms, and vegetables in a spicy and tangy broth.', price: 350, category: 'Chinese', image: '/Uploads/hot-sour-soup.jpg', isAvailable: true, dietaryTags: ['spicy', 'non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Spring Rolls', description: 'Crispy fried rolls stuffed with seasoned vegetables and chicken. Served with sweet chili dipping sauce.', price: 400, category: 'Chinese', image: '/Uploads/spring-rolls.jpg', isAvailable: true, dietaryTags: ['non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sweet & Sour Chicken', description: 'Crispy chicken pieces coated in a vibrant sweet and sour sauce with pineapple and bell peppers.', price: 800, category: 'Chinese', image: '/Uploads/sweet-sour-chicken.jpg', isAvailable: true, dietaryTags: ['non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
 
      // ============ FAST FOOD ============
      { name: 'Classic Beef Burger', description: 'Juicy beef patty with lettuce, tomato, cheese, pickles, and special sauce in a toasted sesame bun.', price: 750, category: 'FastFood', image: '/Uploads/beef-burger.jpg', isAvailable: true, dietaryTags: ['non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Club Sandwich', description: 'Triple-layered toasted sandwich with grilled chicken, egg, lettuce, tomato, and mayo. Served with fries.', price: 600, category: 'FastFood', image: '/Uploads/club-sandwich.jpg', isAvailable: true, dietaryTags: ['non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Loaded Fries', description: 'Crispy golden fries topped with melted cheese, jalapenos, chicken chunks, and garlic mayo.', price: 500, category: 'FastFood', image: '/Uploads/loaded-fries.jpg', isAvailable: true, dietaryTags: ['spicy', 'non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chicken Wings', description: 'Crispy fried chicken wings tossed in your choice of BBQ, hot sauce, or honey garlic glaze.', price: 650, category: 'FastFood', image: '/Uploads/chicken-wings.jpg', isAvailable: true, dietaryTags: ['spicy', 'non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chicken Wrap', description: 'Grilled chicken with fresh veggies, cheese, and ranch dressing wrapped in a soft tortilla.', price: 550, category: 'FastFood', image: '/Uploads/chicken-wrap.jpg', isAvailable: true, dietaryTags: ['non-veg', 'halal'], createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chocolate Milkshake', description: 'Thick and creamy chocolate milkshake made with premium ice cream, topped with whipped cream.', price: 350, category: 'FastFood', image: '/Uploads/milkshake.jpg', isAvailable: true, dietaryTags: ['veg'], createdAt: new Date(), updatedAt: new Date() },
    ];
 
    await db.collection('menus').insertMany(menuItems);
    console.log(`\n${menuItems.length} menu items seeded successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}
 
seed();
require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'Uploads');

const imageUrls = {
  'single-room.jpg': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  'double-room.jpg': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
  'suite-room.jpg': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  'deluxe-room.jpg': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
};

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      console.log(`Image already exists: ${filename}`);
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
    console.log('Downloading room images...');
    for (const [filename, url] of Object.entries(imageUrls)) {
      await downloadImage(url, filename);
    }
    console.log('All images downloaded!\n');

    // Step 2: Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB!');
    const db = mongoose.connection.db;

    const existing = await db.collection('rooms').countDocuments();
    if (existing > 0) {
      console.log(`Already ${existing} rooms exist. Delete them first to re-seed.`);
      process.exit(0);
    }

    // Step 3: Seed rooms
    const rooms = [
      // GROUND FLOOR
      { roomNumber: '101', type: 'single', price: 5000, capacity: 1, description: 'Comfortable single room on the ground floor with a cozy single bed, work desk, and garden view. Perfect for solo travelers.', amenities: ['WiFi', 'AC', 'TV', 'Work Desk', 'Room Service'], images: ['single-room.jpg'], floor: 'ground', status: 'available', createdAt: new Date(), updatedAt: new Date() },
      { roomNumber: '102', type: 'double', price: 8000, capacity: 2, description: 'Spacious double room on the ground floor with a comfortable double bed, seating area, and easy lobby access.', amenities: ['WiFi', 'AC', 'TV', 'Mini Fridge', 'Room Service', 'Seating Area'], images: ['double-room.jpg'], floor: 'ground', status: 'available', createdAt: new Date(), updatedAt: new Date() },
      { roomNumber: '103', type: 'suite', price: 15000, capacity: 4, description: 'Elegant suite on the ground floor with a separate living area, king-size bed, premium furnishings, and private garden access.', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Living Area', 'Bathrobe', 'Safe'], images: ['suite-room.jpg'], floor: 'ground', status: 'available', createdAt: new Date(), updatedAt: new Date() },
      { roomNumber: '104', type: 'deluxe', price: 12000, capacity: 3, description: 'Luxurious deluxe room on the ground floor with premium bedding, modern decor, and a private balcony overlooking the garden.', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Balcony', 'Coffee Maker', 'Bathrobe'], images: ['deluxe-room.jpg'], floor: 'ground', status: 'available', createdAt: new Date(), updatedAt: new Date() },

      // FIRST FLOOR
      { roomNumber: '201', type: 'single', price: 5000, capacity: 1, description: 'Cozy single room on the first floor with a comfortable single bed, work desk, and city view.', amenities: ['WiFi', 'AC', 'TV', 'Work Desk', 'Room Service'], images: ['single-room.jpg'], floor: 'first', status: 'available', createdAt: new Date(), updatedAt: new Date() },
      { roomNumber: '202', type: 'double', price: 8000, capacity: 2, description: 'Spacious double room on the first floor with a queen-size bed, lounge chair, and beautiful city view.', amenities: ['WiFi', 'AC', 'TV', 'Mini Fridge', 'Room Service', 'Seating Area'], images: ['double-room.jpg'], floor: 'first', status: 'available', createdAt: new Date(), updatedAt: new Date() },
      { roomNumber: '203', type: 'suite', price: 15000, capacity: 4, description: 'Premium suite on the first floor with a king-size bed, separate living room, dining area, and panoramic view.', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Living Area', 'Dining Area', 'Bathrobe', 'Safe'], images: ['suite-room.jpg'], floor: 'first', status: 'available', createdAt: new Date(), updatedAt: new Date() },
      { roomNumber: '204', type: 'deluxe', price: 12000, capacity: 3, description: 'Elegant deluxe room on the first floor with luxurious king-size bed, modern amenities, and a private balcony.', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Balcony', 'Coffee Maker', 'Bathrobe'], images: ['deluxe-room.jpg'], floor: 'first', status: 'available', createdAt: new Date(), updatedAt: new Date() },

      // SECOND FLOOR
      { roomNumber: '301', type: 'single', price: 5000, capacity: 1, description: 'Modern single room on the second floor with a comfortable bed, work station, and scenic top-floor view.', amenities: ['WiFi', 'AC', 'TV', 'Work Desk', 'Room Service', 'City View'], images: ['single-room.jpg'], floor: 'second', status: 'available', createdAt: new Date(), updatedAt: new Date() },
      { roomNumber: '302', type: 'double', price: 8000, capacity: 2, description: 'Spacious double room on the second floor with premium double bed, lounge area, and stunning rooftop view.', amenities: ['WiFi', 'AC', 'TV', 'Mini Fridge', 'Room Service', 'Seating Area', 'City View'], images: ['double-room.jpg'], floor: 'second', status: 'available', createdAt: new Date(), updatedAt: new Date() },
      { roomNumber: '303', type: 'suite', price: 15000, capacity: 4, description: 'Luxury penthouse suite on the second floor with king-size bed, spacious living room, jacuzzi bath, and breathtaking skyline view.', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Living Area', 'Jacuzzi', 'Bathrobe', 'Safe', 'City View'], images: ['suite-room.jpg'], floor: 'second', status: 'available', createdAt: new Date(), updatedAt: new Date() },
      { roomNumber: '304', type: 'deluxe', price: 12000, capacity: 3, description: 'Premium deluxe room on the second floor with king-size bed, luxury furnishings, private terrace, and panoramic view.', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Terrace', 'Coffee Maker', 'Bathrobe', 'City View'], images: ['deluxe-room.jpg'], floor: 'second', status: 'available', createdAt: new Date(), updatedAt: new Date() },
    ];

    await db.collection('rooms').insertMany(rooms);
    console.log(`\n${rooms.length} rooms seeded successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
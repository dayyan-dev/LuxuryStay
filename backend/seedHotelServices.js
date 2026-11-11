require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple image download function
const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'Uploads', filename);
    const file = fs.createWriteStream(filePath);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        downloadImage(response.headers.location, filename).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(`/Uploads/${filename}`); });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const db = mongoose.connection.db;

    // Check if already seeded
    const existing = await db.collection('hotelservices').countDocuments();
    if (existing > 0) {
      console.log(`Already ${existing} services exist. Delete them first if you want to re-seed.`);
      process.exit(0);
    }

    // Services with Unsplash images (free, no auth needed)
    const services = [
      {
        name: 'Swimming Pool',
        description: 'Enjoy our heated outdoor swimming pool with stunning views. Open daily with professional lifeguards on duty.',
        category: 'recreation',
        icon: '🏊',
        imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80',
        imageFile: `swimming-pool-${Date.now()}.jpg`,
        timing: '6:00 AM - 10:00 PM',
        price: 'Free for guests',
        isActive: true,
        order: 1
      },
      {
        name: 'Fitness Center',
        description: 'State-of-the-art gym equipped with modern cardio and strength training equipment. Personal trainers available on request.',
        category: 'wellness',
        icon: '🏋️',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
        imageFile: `gym-${Date.now()+1}.jpg`,
        timing: '5:00 AM - 11:00 PM',
        price: 'Free for guests',
        isActive: true,
        order: 2
      },
      {
        name: 'Spa & Wellness',
        description: 'Rejuvenate with our signature massages, facials, and body treatments. Book your appointment in advance.',
        category: 'wellness',
        icon: '🧖',
        imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80',
        imageFile: `spa-${Date.now()+2}.jpg`,
        timing: '9:00 AM - 9:00 PM',
        price: 'PKR 2,500 onwards',
        isActive: true,
        order: 3
      },
      {
        name: 'Restaurant & Dining',
        description: 'Experience fine dining with our award-winning chefs. Offering Pakistani, Continental and Chinese cuisine with live cooking stations.',
        category: 'dining',
        icon: '🍽️',
        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
        imageFile: `restaurant-${Date.now()+3}.jpg`,
        timing: '7:00 AM - 11:00 PM',
        price: 'À la carte',
        isActive: true,
        order: 4
      },
      {
        name: 'Conference & Business Center',
        description: 'Fully equipped meeting rooms with projectors, high-speed WiFi and secretarial services. Perfect for corporate events.',
        category: 'business',
        icon: '💼',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
        imageFile: `conference-${Date.now()+4}.jpg`,
        timing: '8:00 AM - 8:00 PM',
        price: 'PKR 5,000/hour',
        isActive: true,
        order: 5
      },
      {
        name: 'Airport Transfer',
        description: 'Comfortable and reliable airport pickup and drop service available 24/7. Book in advance for hassle-free travel.',
        category: 'transport',
        icon: '🚗',
        imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80',
        imageFile: `transport-${Date.now()+5}.jpg`,
        timing: '24/7',
        price: 'PKR 1,500 onwards',
        isActive: true,
        order: 6
      },
    ];

    console.log('\nDownloading images...');
    const insertData = [];

    for (const service of services) {
      try {
        console.log(`Downloading: ${service.name}...`);
        const imagePath = await downloadImage(service.imageUrl, service.imageFile);
        insertData.push({
          name:        service.name,
          description: service.description,
          category:    service.category,
          icon:        service.icon,
          image:       imagePath,
          timing:      service.timing,
          price:       service.price,
          isActive:    service.isActive,
          order:       service.order,
          createdAt:   new Date(),
          updatedAt:   new Date(),
        });
        console.log(`✓ ${service.name} — image saved`);
      } catch (imgErr) {
        console.log(`⚠ ${service.name} — image failed, inserting without image`);
        insertData.push({
          name:        service.name,
          description: service.description,
          category:    service.category,
          icon:        service.icon,
          image:       null,
          timing:      service.timing,
          price:       service.price,
          isActive:    service.isActive,
          order:       service.order,
          createdAt:   new Date(),
          updatedAt:   new Date(),
        });
      }
    }

    await db.collection('hotelservices').insertMany(insertData);

    console.log(`\n✅ ${insertData.length} hotel services inserted!`);
    insertData.forEach(s => console.log(`  - ${s.name} (${s.category}) | ${s.timing} | ${s.price}`));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();
require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const db = mongoose.connection.db;

    const existing = await db.collection('faqs').countDocuments();
    if (existing > 0) {
      console.log(`Already ${existing} FAQs exist. Delete them first to re-seed.`);
      process.exit(0);
    }

    const faqs = [
      // Booking
      {
        question: 'How do I make a room booking?',
        answer: 'You can book a room directly through our website by selecting your preferred room type, check-in and check-out dates, and completing the booking form. Alternatively, you can contact our front desk for assistance.',
        category: 'booking',
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        question: 'Can I modify or change my booking after confirmation?',
        answer: 'Yes, you can modify your booking by contacting our front desk or through your account on our website. Changes are subject to room availability and may affect the total amount.',
        category: 'booking',
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        question: 'What is the cancellation policy?',
        answer: 'Bookings can be cancelled free of charge up to 24 hours before the check-in date. Cancellations made within 24 hours of check-in may be subject to a one-night charge. No-shows will be charged the full booking amount.',
        category: 'booking',
        isActive: true,
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        question: 'What are the check-in and check-out times?',
        answer: 'Standard check-in time is 2:00 PM and check-out time is 12:00 PM (noon). Early check-in and late check-out may be available upon request, subject to room availability and additional charges.',
        category: 'booking',
        isActive: true,
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Payment
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept cash payments at the front desk as well as online bank transfers. Full payment is required at the time of check-in. We are continuously working to add more payment options for your convenience.',
        category: 'payment',
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, absolutely. Our website uses secure encryption to protect your personal and payment information. We do not store any sensitive payment details on our servers.',
        category: 'payment',
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        question: 'Will I receive an invoice for my stay?',
        answer: 'Yes, a detailed invoice will be provided at checkout covering your room charges, restaurant orders, and any additional services used during your stay. You can also request a digital copy.',
        category: 'payment',
        isActive: true,
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Room
      {
        question: 'What types of rooms are available?',
        answer: 'We offer four room categories — Single, Double, Deluxe, and Suite. Each room comes with modern amenities including air conditioning, flat-screen TV, high-speed WiFi, and 24-hour room service.',
        category: 'room',
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        question: 'Are pets allowed in the rooms?',
        answer: 'We apologize, but pets are not permitted anywhere on the hotel premises to ensure a comfortable experience for all guests. Service animals are an exception with prior documentation.',
        category: 'room',
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        question: 'Is smoking allowed in the rooms?',
        answer: 'Our hotel is a completely smoke-free property. Smoking is strictly prohibited in all rooms and indoor areas. Designated outdoor smoking areas are available. A cleaning fee will be charged for violations.',
        category: 'room',
        isActive: true,
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Restaurant
      {
        question: 'What cuisines does the hotel restaurant offer?',
        answer: 'Our restaurant serves a wide variety of Pakistani, Continental, and Chinese cuisine. We also offer a breakfast buffet daily. Room service is available during restaurant hours for in-room dining.',
        category: 'restaurant',
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // General
      {
        question: 'Is free WiFi available throughout the hotel?',
        answer: 'Yes, complimentary high-speed WiFi is available in all rooms, the lobby, restaurant, and common areas throughout the hotel. Login credentials will be provided at check-in.',
        category: 'general',
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection('faqs').insertMany(faqs);

    console.log(`\n✅ ${faqs.length} FAQs inserted!\n`);
    faqs.forEach(f => console.log(`  [${f.category}] ${f.question}`));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();
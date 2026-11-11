// =====================================================
// fixGuestType.js — Purane users ka guestType fix karo
// Run karo: node fixGuestType.js
// Backend folder mein rakh ke chalao
// =====================================================

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

async function fixGuestType() {
  try {
    console.log('MongoDB se connect ho raha hun...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Step 1: Jo users @walkin.hotel email rakhte hain unhe walk-in mark karo
    const walkinResult = await users.updateMany(
      { email: { $regex: '@walkin.hotel' } },
      { $set: { guestType: 'walk-in' } }
    );
    console.log(`Walk-in users fixed: ${walkinResult.modifiedCount}`);

    // Step 2: Baaki saare guest users jo guestType nahi rakhte unhe online mark karo
    const onlineResult = await users.updateMany(
      { 
        role: 'guest',
        guestType: { $exists: false }
      },
      { $set: { guestType: 'online' } }
    );
    console.log(`Online users fixed: ${onlineResult.modifiedCount}`);

    // Step 3: null guestType wale bhi fix karo
    const nullResult = await users.updateMany(
      { 
        role: 'guest',
        guestType: null
      },
      { $set: { guestType: 'online' } }
    );
    console.log(`Null guestType fixed: ${nullResult.modifiedCount}`);

    console.log('\nSab theek ho gaya! Ab Users page refresh karo.');
    process.exit(0);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixGuestType();
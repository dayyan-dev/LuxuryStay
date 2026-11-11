/**
 * Deluxe Rooms Update Script
 * Run: node update_deluxe_rooms.js
 * (backend folder mein rakho ya alag bhi chal sakta hai)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'YOUR_MONGO_URI_HERE';

mongoose.connect(uri).then(async () => {
  const Room = mongoose.model('Room', new mongoose.Schema({}, { strict: false }), 'rooms');

  // Before
  const before = await Room.find({ type: 'deluxe' });
  console.log('=== BEFORE ===');
  before.forEach(r => console.log(`Room ${r.roomNumber} | capacity: ${r.capacity} | price: ${r.price}`));

  // Update all deluxe rooms
  const result = await Room.updateMany(
    { type: 'deluxe' },
    { $set: { capacity: 8, price: 25000 } }
  );
  console.log(`\n✅ Updated: ${result.modifiedCount} deluxe room(s)`);

  // After
  const after = await Room.find({ type: 'deluxe' });
  console.log('\n=== AFTER ===');
  after.forEach(r => console.log(`Room ${r.roomNumber} | capacity: ${r.capacity} | price: ${r.price}`));

  mongoose.disconnect();
  console.log('\nDone!');
}).catch(e => console.error('Error:', e.message));
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['single', 'double', 'suite', 'deluxe'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  amenities: {
    type: [String]
  },
images: {
  type: [String],
  default: [],
},
  floor: {
    type: String,
    enum: ['ground', 'first', 'second'],
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: false,
  },
  status: {
    type: String,
    enum: [
  "available",
  "reserved",
  "occupied",
  "cleaning",
  "maintenance"
],
    default: "available",
  },
}, { timestamps: true });
// AUTO PREFIX MIDDLEWARE

module.exports = mongoose.model('Room', roomSchema);

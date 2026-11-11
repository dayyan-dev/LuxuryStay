const mongoose = require('mongoose');

let isConnecting = false;

const connectDB = async (retryCount = 0) => {
  if (isConnecting) return;
  if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_atlas_connection_string') {
    console.warn('⚠️ [MongoDB Atlas] MONGO_URI is not set in backend/.env.');
    console.warn('👉 Please paste your MongoDB Atlas connection string into backend/.env (e.g. MONGO_URI=mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/hotelDB)');
    return;
  }
  isConnecting = true;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 25000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    isConnecting = false;
  } catch (err) {
    isConnecting = false;
    console.error(`❌ MongoDB Atlas connection attempt ${retryCount + 1} failed: ${err.message}`);
    const delay = Math.min(4000 * (retryCount + 1), 30000);
    console.log(`⏳ Will retry connecting to MongoDB in ${delay / 1000}s...`);
    setTimeout(() => connectDB(retryCount + 1), delay);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Atlas disconnected. Attempting auto-reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ MongoDB Atlas error:', err.message);
});

module.exports = connectDB;

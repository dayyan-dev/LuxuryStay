const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./Config/Db');

const app = express();
app.set('trust proxy', 1); 
const compression = require('compression');
app.use(compression());
// ============================================================
// SECURITY MIDDLEWARE (must be first)
// ============================================================
const {
  helmetConfig,
  generalLimiter,
  hppConfig,
  corsConfig,
  requestSizeConfig,
} = require('./Middleware/securityMiddleware');

app.use(helmetConfig);                            // Security headers
app.use(cors(corsConfig));                        // CORS
app.use(express.json({ limit: requestSizeConfig.json }));
app.use(express.urlencoded(requestSizeConfig.urlencoded));                  // NoSQL injection protection
app.use(hppConfig);                               // HTTP param pollution protection
app.use(generalLimiter);                          // Rate limiting (all routes)

// ============================================================
// DATABASE
// ============================================================
connectDB();

// ============================================================
// CRON JOBS
// ============================================================
require('./cron/checkinReminder');
require('./cron/checkoutReminder');
require('./cron/feedbackReminder');
require('./cron/backupJob').start();

// ============================================================
// STATIC FILES
// ============================================================
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));
app.use(express.static('Public', {
  maxAge: '30d',
  etag: true,
}));

// ============================================================
// ROUTES
// ============================================================
const mongoose = require('mongoose');
const { authLimiter } = require('./Middleware/securityMiddleware');

// Database readiness check — provides instant helpful error when Atlas is not configured
app.use('/api', (req, res, next) => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_atlas_connection_string') {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is not configured in backend/.env. For local use: mongodb://127.0.0.1:27017/hotelDB',
      code: 'MONGO_NOT_CONFIGURED',
    });
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB Server se connect nahi ho pa raha (Port 27017 check karein ya MongoDB service start karein).',
      code: 'MONGO_CONNECTING',
    });
  }
  next();
});

// Auth (with strict rate limiting)
const authRoutes = require('./Routes/authRoutes');
app.use('/api/auth', authLimiter, authRoutes);

// Core
const hotelRoutes = require('./Routes/hotelRoutes');
const roomRoutes = require('./Routes/roomRoutes');
const bookingRoutes = require('./Routes/bookingRoutes');
const paymentRoutes = require('./Routes/paymentRoutes');
const offerRoutes = require('./Routes/offerRoutes');
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/offers', offerRoutes);

// Operations
const serviceRoutes = require('./Routes/serviceRoutes');
const maintenanceRoutes = require('./Routes/maintenanceRoutes');
const housekeepingRoutes = require('./Routes/housekeepingRoutes');
app.use('/api/services', serviceRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/housekeeping', housekeepingRoutes);

// Restaurant
const restaurantMenuRoutes = require('./Routes/restaurantMenuRoutes');
const restaurantOrderRoutes = require('./Routes/restaurantOrderRoutes');
app.use('/api/restaurant/menu', restaurantMenuRoutes);
app.use('/api/restaurant/orders', restaurantOrderRoutes);
app.use('/api/restaurant/categories', (req, res, next) => {
  req.url = '/categories' + (req.url === '/' ? '' : req.url);
  restaurantMenuRoutes(req, res, next);
});

// Notifications & Content
const notificationRoutes = require('./Routes/notificationRoutes');
const faqRoutes = require('./Routes/faqRoutes');
const hotelServiceRoutes = require('./Routes/hotelServiceRoutes');
const aboutUsRoutes = require('./Routes/aboutUsRoutes');
const settingsRoutes = require('./Routes/settingsRoutes');
const feedbackRoutes = require('./Routes/feedbackRoutes');
app.use('/api/notifications', notificationRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/hotel-services', hotelServiceRoutes);
app.use('/api/about', aboutUsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/feedbacks', feedbackRoutes);

// AI Concierge (Groq)
const chatRoutes = require('./Routes/chatRoutes');
app.use('/api/chat', chatRoutes);

// Audit Logs (Admin only)
const auditLogRoutes = require('./Routes/auditLogRoutes');
app.use('/api/audit-logs', auditLogRoutes);
const pricingRoutes = require('./Routes/pricingRoutes');
app.use('/api/pricing', pricingRoutes);
const guestCRMRoutes = require('./Routes/guestCRMRoutes');
app.use('/api/guest-crm', guestCRMRoutes);

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hotel Management API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// SERVE FRONTEND (React build)
// ============================================================
// app.use(express.static(path.join(__dirname, 'Public')));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);

  if (err.message?.includes('CORS')) {
    return res.status(403).json({ success: false, message: 'CORS: Origin not allowed.' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================================
// START SERVER
// ============================================================
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket connection
io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on('join_hotel', () => {
    socket.join('hotel_room');
    console.log(`Socket ${socket.id} joined hotel_room`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// io globally available karo — controllers mein use hoga
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// ============================================================
// CRASH PREVENTION & PROCESS RESILIENCE
// ============================================================
process.on('uncaughtException', (err) => {
  console.error('🔥 [CRASH PREVENTION] Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 [CRASH PREVENTION] Unhandled Rejection at:', promise, 'reason:', reason);
});


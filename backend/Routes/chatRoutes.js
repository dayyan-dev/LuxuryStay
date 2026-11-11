const express = require('express');
const rateLimit = require('express-rate-limit');
const { chatWithGroq } = require('../Controllers/chatController');

const router = express.Router();

// Soft limit so free Groq quota isn't burned
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 120 : 40,
  message: {
    success: false,
    message: 'Too many chat messages. Please wait a few minutes.',
    fallback: true,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', chatLimiter, chatWithGroq);

module.exports = router;

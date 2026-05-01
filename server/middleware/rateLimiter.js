const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased from 100 to 5000
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased from 10 to 1000
  message: { message: 'Too many auth attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };

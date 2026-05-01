const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const auth = require('../middleware/auth');

// @desc    Get Twilio Network Traversal Service (NTS) tokens for WebRTC
// @route   GET /api/turn
router.get('/', auth, async (req, res, next) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.warn('⚠️ Twilio keys missing. Falling back to public STUN servers.');
      // Fallback to public STUN if keys aren't set
      return res.json([
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]);
    }

    const client = twilio(accountSid, authToken);
    
    // Create temporary token that lasts for 86400 seconds (24 hours)
    const token = await client.tokens.create({ ttl: 86400 });
    
    // Return the generated iceServers array
    res.json(token.iceServers);
  } catch (error) {
    console.error('Twilio Error:', error.message);
    next(error);
  }
});

module.exports = router;

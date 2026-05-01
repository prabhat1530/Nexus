const router = require('express').Router();
const { register, login, refreshAccessToken, logout, registerValidation, loginValidation } = require('../controllers/authController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', auth, logout);

module.exports = router;

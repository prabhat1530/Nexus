const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const existingUsername = await User.findOne({
      where: { username },
    });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already taken.' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'Registration successful',
      user: user.toSafeJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token & update online status
    user.refreshToken = refreshToken;
    user.isOnline = true;
    await user.save();

    res.json({
      message: 'Login successful',
      user: user.toSafeJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required.' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user.id);

    res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token.' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const user = req.user;
    user.refreshToken = null;
    user.isOnline = false;
    user.lastSeen = new Date();
    await user.save();

    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be 2-100 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  registerValidation,
  loginValidation,
};

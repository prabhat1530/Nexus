const { Op } = require('sequelize');
const { User, Follow, Post, Notification } = require('../models');
const { sequelize } = require('../config/db');

// @desc    Get current user profile
// @route   GET /api/users/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'refreshToken'] },
    });

    const followersCount = await Follow.count({ where: { followingId: user.id } });
    const followingCount = await Follow.count({ where: { followerId: user.id } });
    const postsCount = await Post.count({ where: { authorId: user.id } });

    res.json({
      ...user.toSafeJSON(),
      followersCount,
      followingCount,
      postsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'refreshToken'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const followersCount = await Follow.count({ where: { followingId: user.id } });
    const followingCount = await Follow.count({ where: { followerId: user.id } });
    const postsCount = await Post.count({ where: { authorId: user.id } });

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({
        where: { followerId: req.user.id, followingId: user.id },
      });
      isFollowing = !!follow;
    }

    res.json({
      ...user.toSafeJSON(),
      followersCount,
      followingCount,
      postsCount,
      isFollowing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json([]);
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${q}%` } },
          { fullName: { [Op.iLike]: `%${q}%` } },
        ],
        id: { [Op.ne]: req.user.id },
      },
      attributes: ['id', 'username', 'fullName', 'avatar', 'isOnline'],
      limit: 20,
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio } = req.body;
    let avatar = req.body.avatar;
    const user = await User.findByPk(req.user.id);

    if (req.file) {
      avatar = req.file.path; // Cloudinary returns the full URL in path
    }

    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow/Unfollow user
// @route   PUT /api/users/follow/:id
const toggleFollow = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id);

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const existingFollow = await Follow.findOne({
      where: { followerId: req.user.id, followingId: targetUserId },
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();

      // Remove follow notification
      await Notification.destroy({
        where: {
          senderId: req.user.id,
          recipientId: targetUserId,
          type: 'follow',
        },
      });

      res.json({ message: 'Unfollowed successfully', isFollowing: false });
    } else {
      // Follow
      await Follow.create({
        followerId: req.user.id,
        followingId: targetUserId,
      });

      // Create notification
      await Notification.create({
        senderId: req.user.id,
        recipientId: targetUserId,
        type: 'follow',
      });

      res.json({ message: 'Followed successfully', isFollowing: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get followers of a user
// @route   GET /api/users/:id/followers
const getFollowers = async (req, res, next) => {
  try {
    const follows = await Follow.findAll({
      where: { followingId: req.params.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'avatar', 'isOnline'],
        },
      ],
    });

    // We need a different approach since Follow doesn't have 'user' alias
    const followerIds = follows.map((f) => f.followerId);
    const followers = await User.findAll({
      where: { id: { [Op.in]: followerIds } },
      attributes: ['id', 'username', 'fullName', 'avatar', 'isOnline'],
    });

    res.json(followers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get following of a user
// @route   GET /api/users/:id/following
const getFollowing = async (req, res, next) => {
  try {
    const follows = await Follow.findAll({
      where: { followerId: req.params.id },
    });

    const followingIds = follows.map((f) => f.followingId);
    const following = await User.findAll({
      where: { id: { [Op.in]: followingIds } },
      attributes: ['id', 'username', 'fullName', 'avatar', 'isOnline'],
    });

    res.json(following);
  } catch (error) {
    next(error);
  }
};

// @desc    Get suggested users
// @route   GET /api/users/suggestions
const getSuggestions = async (req, res, next) => {
  try {
    // Get IDs of users the current user already follows
    const follows = await Follow.findAll({
      where: { followerId: req.user.id },
      attributes: ['followingId'],
    });
    const followingIds = follows.map((f) => f.followingId);
    followingIds.push(req.user.id); // Exclude self

    const suggestions = await User.findAll({
      where: {
        id: { [Op.notIn]: followingIds },
      },
      attributes: ['id', 'username', 'fullName', 'avatar', 'bio', 'isOnline'],
      limit: 10,
      order: sequelize.random(),
    });

    res.json(suggestions);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  getUserById,
  searchUsers,
  updateProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  getSuggestions,
};

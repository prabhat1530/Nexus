const { Story, User, Follow, StoryView } = require('../models');
const { Op } = require('sequelize');

const createStory = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Story image is required.' });
    }

    const story = await Story.create({
      userId: req.user.id,
      imageUrl: req.file.path,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    const fullStory = await Story.findByPk(story.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'avatar'] }],
    });

    res.status(201).json(fullStory);
  } catch (error) { next(error); }
};

const getFeedStories = async (req, res, next) => {
  try {
    // Get list of users the current user follows
    const following = await Follow.findAll({
      where: { followerId: req.user.id },
      attributes: ['followingId'],
    });
    const followingIds = following.map(f => f.followingId);
    followingIds.push(req.user.id); // Include user's own stories

    const stories = await Story.findAll({
      where: {
        userId: { [Op.in]: followingIds },
        expiresAt: { [Op.gt]: new Date() }, // Not expired
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'avatar'] },
        {
          model: StoryView,
          as: 'views',
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'avatar'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    // Group stories by user for the horizontal bar
    const grouped = stories.reduce((acc, story) => {
      const userId = story.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
        };
      }
      
      const storyData = story.toJSON();
      // If the current user is NOT the owner of the story, they shouldn't see individual viewer names
      // Or maybe they should? The user request said "who seen the story name visible"
      // Usually only the owner sees the list of names. 
      // I'll keep the full data for now and handle UI logic on frontend or here.
      // Let's keep it simple: owner sees everything, others see count.
      if (storyData.userId !== req.user.id) {
        storyData.viewsCount = storyData.views.length;
        delete storyData.views; // Hide viewer list for non-owners
      } else {
        storyData.viewsCount = storyData.views.length;
      }
      
      acc[userId].stories.push(storyData);
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) { next(error); }
};

const markStoryAsViewed = async (req, res, next) => {
  try {
    const storyId = req.params.id;
    const userId = req.user.id;

    const story = await Story.findByPk(storyId);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    // Don't record own view if you want
    // if (story.userId === userId) return res.json({ message: 'Own story' });

    // Check if already viewed
    const existingView = await StoryView.findOne({ where: { storyId, userId } });
    if (!existingView) {
      await StoryView.create({ storyId, userId });
    }

    res.json({ message: 'Story marked as viewed' });
  } catch (error) { next(error); }
};

const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findByPk(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    await StoryView.destroy({ where: { storyId: story.id } });
    await story.destroy();
    res.json({ message: 'Story deleted' });
  } catch (error) { next(error); }
};

module.exports = { createStory, getFeedStories, markStoryAsViewed, deleteStory };

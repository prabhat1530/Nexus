const { Op } = require('sequelize');
const { body } = require('express-validator');
const { Post, User, Comment, Like, Follow, Notification } = require('../models');
const { sequelize } = require('../config/db');

const createPost = async (req, res, next) => {
  try {
    const content = req.body.content || '';
    let image = req.body.image || null;
    if (req.file) {
      image = req.file.path; // Cloudinary returns the full URL in path
    }

    if (!content && !image) {
      return res.status(400).json({ message: 'Post must have either content or an image.' });
    }

    const post = await Post.create({ authorId: req.user.id, content, image });
    const fullPost = await Post.findByPk(post.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'avatar'] }],
    });
    res.status(201).json({ ...fullPost.toJSON(), likesCount: 0, commentsCount: 0, isLiked: false });
  } catch (error) { next(error); }
};

const enrichPosts = async (posts, userId) => {
  return Promise.all(posts.map(async (post) => {
    const likesCount = await Like.count({ where: { postId: post.id } });
    const commentsCount = await Comment.count({ where: { postId: post.id } });
    const isLiked = !!(await Like.findOne({ where: { postId: post.id, userId } }));
    return { ...post.toJSON(), likesCount, commentsCount, isLiked };
  }));
};

const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const follows = await Follow.findAll({ where: { followerId: req.user.id }, attributes: ['followingId'] });
    const ids = follows.map((f) => f.followingId);
    ids.push(req.user.id);
    const { count, rows } = await Post.findAndCountAll({
      where: { authorId: { [Op.in]: ids } },
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'avatar'] }],
      order: [['createdAt', 'DESC']], limit, offset, distinct: true,
    });
    const posts = await enrichPosts(rows, req.user.id);
    res.json({ posts, totalPages: Math.ceil(count / limit), currentPage: page, hasMore: page * limit < count });
  } catch (error) { next(error); }
};

const getExplore = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { count, rows } = await Post.findAndCountAll({
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'avatar'] }],
      order: [['createdAt', 'DESC']], limit, offset, distinct: true,
    });
    const posts = await enrichPosts(rows, req.user.id);
    res.json({ posts, totalPages: Math.ceil(count / limit), currentPage: page, hasMore: page * limit < count });
  } catch (error) { next(error); }
};

const getPost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'avatar'] },
        { model: Comment, as: 'comments', include: [{ model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'avatar'] }] },
      ],
    });
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    const likesCount = await Like.count({ where: { postId: post.id } });
    const isLiked = !!(await Like.findOne({ where: { postId: post.id, userId: req.user.id } }));
    res.json({ ...post.toJSON(), likesCount, commentsCount: post.comments.length, isLiked });
  } catch (error) { next(error); }
};

const getUserPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { count, rows } = await Post.findAndCountAll({
      where: { authorId: req.params.userId },
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'avatar'] }],
      order: [['createdAt', 'DESC']], limit, offset, distinct: true,
    });
    const posts = await enrichPosts(rows, req.user.id);
    res.json({ posts, totalPages: Math.ceil(count / limit), currentPage: page, hasMore: page * limit < count });
  } catch (error) { next(error); }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'Not authorized.' });
    if (req.body.content) post.content = req.body.content;
    if (req.body.image !== undefined) post.image = req.body.image;
    await post.save();
    const fullPost = await Post.findByPk(post.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'avatar'] }],
    });
    res.json(fullPost);
  } catch (error) { next(error); }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'Not authorized.' });
    await Comment.destroy({ where: { postId: post.id } });
    await Like.destroy({ where: { postId: post.id } });
    await Notification.destroy({ where: { postId: post.id } });
    await post.destroy();
    res.json({ message: 'Post deleted successfully.' });
  } catch (error) { next(error); }
};

const toggleLike = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    const existing = await Like.findOne({ where: { userId: req.user.id, postId } });
    if (existing) {
      await existing.destroy();
      await Notification.destroy({ where: { senderId: req.user.id, postId, type: 'like' } });
      const likesCount = await Like.count({ where: { postId } });
      res.json({ isLiked: false, likesCount });
    } else {
      await Like.create({ userId: req.user.id, postId });
      if (post.authorId !== req.user.id) {
        await Notification.create({ senderId: req.user.id, recipientId: post.authorId, type: 'like', postId });
      }
      const likesCount = await Like.count({ where: { postId } });
      res.json({ isLiked: true, likesCount });
    }
  } catch (error) { next(error); }
};

const addComment = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    const comment = await Comment.create({ userId: req.user.id, postId, text: req.body.text });
    const full = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'avatar'] }],
    });
    if (post.authorId !== req.user.id) {
      await Notification.create({ senderId: req.user.id, recipientId: post.authorId, type: 'comment', postId });
    }
    const commentsCount = await Comment.count({ where: { postId } });
    res.status(201).json({ comment: full, commentsCount });
  } catch (error) { next(error); }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });
    if (comment.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized.' });
    await comment.destroy();
    const commentsCount = await Comment.count({ where: { postId: req.params.postId } });
    res.json({ message: 'Comment deleted.', commentsCount });
  } catch (error) { next(error); }
};

const createPostValidation = [
  body('content').optional({ checkFalsy: true }).trim().isLength({ max: 5000 }).withMessage('Content max 5000 chars'),
];
const commentValidation = [
  body('text').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment required (max 2000 chars)'),
];

module.exports = {
  createPost, getFeed, getExplore, getPost, getUserPosts, updatePost, deletePost,
  toggleLike, addComment, deleteComment, createPostValidation, commentValidation,
};

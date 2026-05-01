const { Notification, User, Post } = require('../models');

const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Notification.findAndCountAll({
      where: { recipientId: req.user.id },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'fullName', 'avatar'] },
        { model: Post, as: 'post', attributes: ['id', 'content'] },
      ],
      order: [['createdAt', 'DESC']],
      limit, offset,
    });

    res.json({
      notifications: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      hasMore: page * limit < count,
    });
  } catch (error) { next(error); }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.update({ read: true }, { where: { recipientId: req.user.id, read: false } });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) { next(error); }
};

const markOneRead = async (req, res, next) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif || notif.recipientId !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    notif.read = true;
    await notif.save();
    res.json(notif);
  } catch (error) { next(error); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.count({ where: { recipientId: req.user.id, read: false } });
    res.json({ count });
  } catch (error) { next(error); }
};

module.exports = { getNotifications, markAllRead, markOneRead, getUnreadCount };

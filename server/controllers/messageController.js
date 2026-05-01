const { Op } = require('sequelize');
const { Conversation, ConversationParticipant, Message, User, MessageRead } = require('../models');

const getConversations = async (req, res, next) => {
  try {
    const participantEntries = await ConversationParticipant.findAll({
      where: { userId: req.user.id }, attributes: ['conversationId'],
    });
    const convIds = participantEntries.map((p) => p.conversationId);
    if (convIds.length === 0) return res.json([]);

    const conversations = await Conversation.findAll({
      where: { id: { [Op.in]: convIds } },
      include: [{ model: User, as: 'participants', attributes: ['id', 'username', 'fullName', 'avatar', 'isOnline', 'lastSeen'], through: { attributes: [] } }],
      order: [['updatedAt', 'DESC']],
    });

    const enriched = await Promise.all(conversations.map(async (conv) => {
      const lastMsg = await Message.findOne({
        where: { conversationId: conv.id }, order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
      });
      const unread = await Message.count({
        where: {
          conversationId: conv.id,
          senderId: { [Op.ne]: req.user.id },
          id: { [Op.notIn]: (await MessageRead.findAll({ where: { userId: req.user.id }, attributes: ['messageId'] })).map(r => r.messageId) },
        },
      });
      return { ...conv.toJSON(), lastMessage: lastMsg, unreadCount: unread };
    }));

    res.json(enriched);
  } catch (error) { next(error); }
};

const createOrGetConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json({ message: 'participantId required.' });
    if (parseInt(participantId) === req.user.id) return res.status(400).json({ message: 'Cannot chat with yourself.' });

    const targetUser = await User.findByPk(participantId);
    if (!targetUser) return res.status(404).json({ message: 'User not found.' });

    // Find existing conversation between these two users
    const myConvs = await ConversationParticipant.findAll({ where: { userId: req.user.id }, attributes: ['conversationId'] });
    const myConvIds = myConvs.map((c) => c.conversationId);

    if (myConvIds.length > 0) {
      const shared = await ConversationParticipant.findOne({
        where: { conversationId: { [Op.in]: myConvIds }, userId: participantId },
      });
      if (shared) {
        const conv = await Conversation.findByPk(shared.conversationId, {
          include: [{ model: User, as: 'participants', attributes: ['id', 'username', 'fullName', 'avatar', 'isOnline', 'lastSeen'], through: { attributes: [] } }],
        });
        return res.json(conv);
      }
    }

    // Create new conversation
    const conv = await Conversation.create();
    await ConversationParticipant.bulkCreate([
      { conversationId: conv.id, userId: req.user.id },
      { conversationId: conv.id, userId: parseInt(participantId) },
    ]);

    const fullConv = await Conversation.findByPk(conv.id, {
      include: [{ model: User, as: 'participants', attributes: ['id', 'username', 'fullName', 'avatar', 'isOnline', 'lastSeen'], through: { attributes: [] } }],
    });

    res.status(201).json(fullConv);
  } catch (error) { next(error); }
};

const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Verify user is participant
    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId: req.user.id },
    });
    if (!participant) return res.status(403).json({ message: 'Not a participant.' });

    const { count, rows } = await Message.findAndCountAll({
      where: { conversationId },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'fullName', 'avatar'] },
        { model: MessageRead, as: 'reads', include: [{ model: User, as: 'user', attributes: ['id', 'username'] }] },
      ],
      order: [['createdAt', 'DESC']],
      limit, offset,
    });

    res.json({
      messages: rows.reverse(),
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      hasMore: page * limit < count,
    });
  } catch (error) { next(error); }
};

const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { text, image } = req.body;
    if (!text && !image) return res.status(400).json({ message: 'Message text or image required.' });

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId: req.user.id },
    });
    if (!participant) return res.status(403).json({ message: 'Not a participant.' });

    const message = await Message.create({
      conversationId: parseInt(conversationId), senderId: req.user.id, text, image: image || null,
    });

    // Mark as read by sender
    await MessageRead.create({ messageId: message.id, userId: req.user.id });

    // Update conversation timestamp
    await Conversation.update({ updatedAt: new Date() }, { where: { id: conversationId } });

    const fullMsg = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'fullName', 'avatar'] },
        { model: MessageRead, as: 'reads', include: [{ model: User, as: 'user', attributes: ['id', 'username'] }] },
      ],
    });

    res.status(201).json(fullMsg);
  } catch (error) { next(error); }
};

const markMessagesRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const unreadMessages = await Message.findAll({
      where: { conversationId, senderId: { [Op.ne]: req.user.id } },
      attributes: ['id'],
    });
    const msgIds = unreadMessages.map(m => m.id);
    const alreadyRead = await MessageRead.findAll({
      where: { userId: req.user.id, messageId: { [Op.in]: msgIds } }, attributes: ['messageId'],
    });
    const readIds = new Set(alreadyRead.map(r => r.messageId));
    const toMark = msgIds.filter(id => !readIds.has(id));

    if (toMark.length > 0) {
      await MessageRead.bulkCreate(toMark.map(messageId => ({ messageId, userId: req.user.id })));
    }
    res.json({ message: 'Messages marked as read.', count: toMark.length });
  } catch (error) { next(error); }
};

module.exports = { getConversations, createOrGetConversation, getMessages, sendMessage, markMessagesRead };

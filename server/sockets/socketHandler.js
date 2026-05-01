const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Active users map: userId -> socketId
const activeUsers = new Map();

const getRecipientSocketId = (userId) => activeUsers.get(Number(userId));

const setupSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'username', 'fullName', 'avatar'],
      });
      if (!user) return next(new Error('User not found'));
      socket.userId = user.id;
      socket.userData = user.toJSON();
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`🟢 User connected: ${socket.userData.username} (${userId})`);

    // Add to active users
    activeUsers.set(userId, socket.id);

    try {
      // Update online status
      await User.update({ isOnline: true }, { where: { id: userId } });
      // Broadcast online status
      io.emit('userOnline', { userId, username: socket.userData.username });
      // Send active users list to newly connected user
      socket.emit('activeUsers', Array.from(activeUsers.keys()));
    } catch (err) {
      console.error('Socket connection error:', err);
    }

    // ===== CHAT EVENTS =====
    socket.on('sendMessage', (data) => {
      try {
        const { recipientId, message } = data;
        const recipientSocketId = getRecipientSocketId(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receiveMessage', message);
        }
      } catch (err) { console.error('sendMessage error:', err); }
    });

    socket.on('typing', ({ conversationId, recipientId }) => {
      try {
        const recipientSocketId = getRecipientSocketId(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('typing', { conversationId, userId, user: socket.userData });
        }
      } catch (err) { console.error('typing error:', err); }
    });

    socket.on('stopTyping', ({ conversationId, recipientId }) => {
      try {
        const recipientSocketId = getRecipientSocketId(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('stopTyping', { conversationId, userId });
        }
      } catch (err) { console.error('stopTyping error:', err); }
    });

    socket.on('messageSeen', ({ conversationId, recipientId }) => {
      try {
        const recipientSocketId = getRecipientSocketId(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('messageSeen', { conversationId, userId });
        }
      } catch (err) { console.error('messageSeen error:', err); }
    });

    // ===== NOTIFICATION EVENTS =====
    socket.on('sendNotification', ({ recipientId, notification }) => {
      try {
        const recipientSocketId = getRecipientSocketId(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('newNotification', notification);
        }
      } catch (err) { console.error('sendNotification error:', err); }
    });

    // ===== POST EVENTS =====
    socket.on('postLiked', ({ postAuthorId, data }) => {
      try {
        const authorSocketId = getRecipientSocketId(postAuthorId);
        if (authorSocketId) {
          io.to(authorSocketId).emit('postLikeUpdate', data);
        }
        socket.broadcast.emit('postLikeUpdate', data);
      } catch (err) { console.error('postLiked error:', err); }
    });

    // ===== VIDEO CALL EVENTS =====
    socket.on('callUser', ({ recipientId, signalData, from, callerName, callType }) => {
      try {
        console.log(`📞 callUser: ${callerName} (${from}) → user ${recipientId} [${callType}]`);
        const recipientSocketId = getRecipientSocketId(recipientId);
        if (recipientSocketId) {
          console.log(`📞 Sending incomingCall to socket ${recipientSocketId}`);
          io.to(recipientSocketId).emit('incomingCall', { 
            signal: signalData, 
            from, 
            callerName,
            callerAvatar: socket.userData?.avatar,
            callType: callType || 'video',
          });
        } else {
          console.log(`📞 User ${recipientId} NOT FOUND in activeUsers`);
        }
      } catch (err) { console.error('callUser error:', err); }
    });

    socket.on('answerCall', (data) => {
      try {
        console.log(`📞 answerCall: user ${userId} → user ${data.to}`);
        const recipientSocketId = getRecipientSocketId(data.to);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('callAccepted', data.signal);
        } else {
          console.log(`📞 answerCall: user ${data.to} NOT FOUND`);
        }
      } catch (err) { console.error('answerCall error:', err); }
    });

    socket.on('iceCandidate', (data) => {
      try {
        const recipientSocketId = getRecipientSocketId(data.to);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('iceCandidate', data.candidate);
        }
      } catch (err) { console.error('iceCandidate error:', err); }
    });

    socket.on('endCall', ({ to }) => {
      try {
        console.log(`📞 endCall: user ${userId} ending call with user ${to}`);
        const recipientSocketId = getRecipientSocketId(to);
        if (recipientSocketId) {
          console.log(`📞 Sending callEnded to socket ${recipientSocketId}`);
          io.to(recipientSocketId).emit('callEnded');
        } else {
          console.log(`📞 endCall: user ${to} NOT FOUND in activeUsers`);
        }
      } catch (err) { console.error('endCall error:', err); }
    });

    // ===== DISCONNECT =====
    socket.on('disconnect', async () => {
      try {
        console.log(`🔴 User disconnected: ${socket.userData.username} (${userId})`);
        activeUsers.delete(userId);
        await User.update({ isOnline: false, lastSeen: new Date() }, { where: { id: userId } });
        io.emit('userOffline', { userId, username: socket.userData.username });
      } catch (err) { console.error('disconnect error:', err); }
    });
  });
};

module.exports = { setupSocket, activeUsers, getRecipientSocketId };

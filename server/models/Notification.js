const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'recipient_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sender_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('like', 'comment', 'follow'),
    allowNull: false,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'post_id',
    references: {
      model: 'posts',
      key: 'id',
    },
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'notifications',
  updatedAt: false,
});

module.exports = Notification;

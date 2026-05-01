const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MessageRead = sequelize.define('MessageRead', {
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'message_id',
    references: {
      model: 'messages',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  readAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'read_at',
  },
}, {
  tableName: 'message_reads',
  timestamps: false,
});

module.exports = MessageRead;

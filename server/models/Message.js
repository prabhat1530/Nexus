const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'conversation_id',
    references: {
      model: 'conversations',
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
  text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
}, {
  tableName: 'messages',
  updatedAt: false,
});

module.exports = Message;

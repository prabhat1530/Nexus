const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'conversation_id',
    references: {
      model: 'conversations',
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
}, {
  tableName: 'conversation_participants',
  timestamps: false,
});

module.exports = ConversationParticipant;

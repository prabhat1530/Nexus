const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
}, {
  tableName: 'conversations',
});

module.exports = Conversation;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const StoryView = sequelize.define('StoryView', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  storyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'story_id',
    references: {
      model: 'stories',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'story_views',
  timestamps: true,
});

module.exports = StoryView;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Story = sequelize.define('Story', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'image_url',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
}, {
  tableName: 'stories',
});

module.exports = Story;

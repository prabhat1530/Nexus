const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Like = sequelize.define('Like', {
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
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'post_id',
    references: {
      model: 'posts',
      key: 'id',
    },
  },
}, {
  tableName: 'likes',
  updatedAt: false,
});

module.exports = Like;

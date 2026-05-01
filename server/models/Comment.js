const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Comment = sequelize.define('Comment', {
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
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'post_id',
    references: {
      model: 'posts',
      key: 'id',
    },
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 2000],
    },
  },
}, {
  tableName: 'comments',
});

module.exports = Comment;

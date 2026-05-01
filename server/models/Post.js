const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'author_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
    validate: {
      len: [0, 5000],
    },
  },
  image: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
}, {
  tableName: 'posts',
});

module.exports = Post;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Follow = sequelize.define('Follow', {
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'follower_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'following_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'follows',
  updatedAt: false,
});

module.exports = Follow;

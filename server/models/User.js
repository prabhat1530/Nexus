const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
      is: /^[a-zA-Z0-9_]+$/,
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'full_name',
  },
  avatar: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
  bio: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_online',
  },
  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'last_seen',
  },
  refreshToken: {
    type: DataTypes.TEXT,
    defaultValue: null,
    field: 'refresh_token',
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toSafeJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.refreshToken;
  return values;
};

module.exports = User;

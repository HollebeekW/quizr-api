const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const UserModel = {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    avatar_url: { type: DataTypes.STRING, allowNull: true },
};

module.exports = ( sequelize ) => sequelize.define('users', UserModel );
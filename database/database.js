const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_PATH || './storage/database.sqlite',
    define: {
        timestamps: true
    }
});

// Initialize models
const User = require('../models/User')(sequelize);
const EmailVerificationToken = require('../models/EmailVerificationToken')(sequelize);

// Define associations
User.hasOne(EmailVerificationToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
EmailVerificationToken.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, EmailVerificationToken };
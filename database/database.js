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
const ResetPasswordToken = require('../models/ResetPasswordToken')(sequelize);

// Define associations
User.hasOne(EmailVerificationToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
EmailVerificationToken.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(ResetPasswordToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
ResetPasswordToken.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, EmailVerificationToken, ResetPasswordToken };
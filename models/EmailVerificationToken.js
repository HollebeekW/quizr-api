const { DataTypes } = require('sequelize');

const EmailVerificationTokenModel = {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { 
        type: DataTypes.UUID, 
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    token: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
};

module.exports = (sequelize) => sequelize.define('email_verification_tokens', EmailVerificationTokenModel);

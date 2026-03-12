const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_PATH || './storage/database.sqlite',
    define: {
        timestamps: true
    }
});

module.exports = sequelize;
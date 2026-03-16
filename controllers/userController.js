const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize, User } = require('../database/database');

// GET users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['username', 'avatar_url']
        })
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize, User } = require('../database/database');
const { sendPasswordChangedEmail } = require('../email_service/transporter');

// GET users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET user by id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH update password
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { currentPassword, newPassword } = req.body;
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

        if (isSamePassword) {
            return res.status(400).json({ message: 'New password cannot be the same as the current password' });
        }

        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(8); // only for development, use a higher salt rounds in production, e.g., 12 or more
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.passwordHash = hashedPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
        await sendPasswordChangedEmail(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize, User, EmailVerificationToken } = require('../database/database');
const { sendPasswordChangedEmail, sendConfirmationEmail } = require('../email_service/transporter');

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

        try {
            await sendPasswordChangedEmail(user);
        } catch (emailError) {
            console.error('Password changed email sending failed:', emailError);
        }

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH update email address
exports.updateEmail = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { newEmail } = req.body;
        const existingUser = await User.findOne({ where: { email: newEmail } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }
        if (user.email === newEmail) {
            return res.status(400).json({ message: 'New email cannot be the same as the current email' });
        }
        user.email = newEmail;
        user.email_verified = false;
        await user.save();

        const verificationToken = await EmailVerificationToken.create({
            userId: user.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        try {
            await sendConfirmationEmail(user, verificationToken.token);
    } catch (emailError) {
        console.error('Email confirmation sending failed:', emailError);
        return res.status(500).json({ message: 'Email sending failed', error: emailError.message });
    }

    res.json({ message: 'Email updated successfully. You will be logged out and need to confirm and then log in with your new email.' });

} catch (error) {
    res.status(500).json({ message: error.message });
}
};

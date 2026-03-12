const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sequelize = require('../database/database');
const User = require('../models/User')(sequelize);
const sendConfirmationEmail = require('../email_service/transporter');

const encryptPassword = (password) =>
    bcrypt.hash(password, 8); // only for development, use a higher salt rounds in production, e.g., 12 or more

const generateAccessToken = (user, userId) =>
    jwt.sign({ user, userId }, process.env.JWT_SECRET, { expiresIn: '24h' }); // token expires in 24 hours, adjust as needed

const generateEmailToken = (userId) =>
    jwt.sign({ userId, purpose: 'email_verification' }, process.env.JWT_SECRET, { expiresIn: '24h' });

exports.register = async (req, res) => {
    try {
        const { email, username, password, confirmPassword } = req.body;
        const encryptedPassword = encryptPassword(password);

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already in use' });
        }

        const user = await User.create({
            email,
            username,
            passwordHash: await encryptedPassword
        });

        // Send confirmation email
        const emailToken = generateEmailToken(user.id);
        await sendConfirmationEmail(user, emailToken);

        const accessToken = generateAccessToken(user.username, user.id);
        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            user: { id: user.id, email: user.email, username: user.username },
            token: accessToken
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    };
};

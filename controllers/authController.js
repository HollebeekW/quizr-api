const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sequelize = require('../database/database');
const User = require('../models/User')(sequelize);
const { sendConfirmationEmail, sendPasswordResetEmail, sendPasswordChangedEmail } = require('../email_service/transporter');

const encryptPassword = (password) =>
    bcrypt.hash(password, 8); // only for development, use a higher salt rounds in production, e.g., 12 or more

const generateAccessToken = (user, userId) =>
    jwt.sign({ user, userId }, process.env.JWT_SECRET, { expiresIn: '24h' }); // token expires in 24 hours, adjust as needed

const generateEmailToken = (userId) =>
    jwt.sign({ userId, purpose: 'email_verification' }, process.env.JWT_SECRET, { expiresIn: '24h' });


// POST: /auth/signup
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

// GET: /auth/verify-email?token=...
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.purpose !== 'email_verification') {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.email_verified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        await user.update({ email_verified: true });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Verification link has expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid verification token' });
        }
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// POST: /auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (!user.email_verified) {
            return res.status(403).json({ message: 'Email not verified. Please check your email for the verification link.' });
        }

        const accessToken = generateAccessToken(user.username, user.id);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, email: user.email, username: user.username },
            token: accessToken
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    };
};

// GET: /auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'No account found with that email address' });
        }

        // Generate password reset token
        const resetToken = jwt.sign({ userId: user.id, purpose: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await sendPasswordResetEmail(user, resetToken);
        res.status(200).json({
            success: true,
            message: 'Password reset email sent. Please check your inbox.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    };
}

// POST: /auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmNewPassword } = req.body;
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.purpose !== 'password_reset') {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ passwordHash: hashedPassword });

        await sendPasswordChangedEmail(user);

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Password reset link has expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid password reset token' });
        }
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


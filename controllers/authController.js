const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize, User, EmailVerificationToken, ResetPasswordToken } = require('../database/database');
const { sendConfirmationEmail, sendPasswordResetEmail, sendPasswordChangedEmail } = require('../email_service/transporter');

const encryptPassword = (password) =>
    bcrypt.hash(password, 8); // only for development, use a higher salt rounds in production, e.g., 12 or more

const generateAccessToken = (user, userId) =>
    jwt.sign({ user, userId }, process.env.JWT_SECRET, { expiresIn: '24h' }); // token expires in 24 hours, adjust as needed


// POST: /auth/signup
exports.register = async (req, res) => {
    try {
        const { email, username, password, confirmPassword } = req.body;
        
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
            passwordHash: await encryptPassword(password)
        });

        // Create verification token in database
        const verificationToken = await EmailVerificationToken.create({
            userId: user.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        // Send confirmation email
        await sendConfirmationEmail(user, verificationToken.token);

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

        // Find token in database
        const verificationToken = await EmailVerificationToken.findOne({
            where: { token },
            include: User
        });

        if (!verificationToken) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }

        // Check if token has expired
        if (new Date() > verificationToken.expiresAt) {
            await verificationToken.destroy();
            return res.status(400).json({ message: 'Verification link has expired' });
        }

        const user = verificationToken.user;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.email_verified) {
            await verificationToken.destroy();
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Mark user as verified and delete token
        await user.update({ email_verified: true });
        await verificationToken.destroy();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
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

        // Delete any existing reset tokens for this user
        await ResetPasswordToken.destroy({ where: { userId: user.id } });

        // Create password reset token in database
        const resetToken = await ResetPasswordToken.create({
            userId: user.id,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        });

        await sendPasswordResetEmail(user, resetToken.token);
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
        
        // Find token in database
        const resetToken = await ResetPasswordToken.findOne({
            where: { token },
            include: User
        });

        if (!resetToken) {
            return res.status(400).json({ message: 'Invalid password reset token' });
        }

        // Check if token has expired
        if (new Date() > resetToken.expiresAt) {
            await resetToken.destroy();
            return res.status(400).json({ message: 'Password reset link has expired' });
        }

        const user = resetToken.user;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ passwordHash: hashedPassword });

        // Delete the used token
        await resetToken.destroy();

        await sendPasswordChangedEmail(user);

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
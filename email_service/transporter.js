const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendConfirmationEmail = async (user, confirmationToken) => {
    const confirmLink = `${process.env.APP_URL}/auth/verify-email?token=${confirmationToken}`;
    
    const info = await transporter.sendMail({
        from: `"Quizr Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Please confirm your email',
        text: `Click the link to confirm your email: ${confirmLink}`,
        html: `<p>Hi ${user.username},</p><p>Click the link to confirm your email: <a href="${confirmLink}">Confirm Email</a></p>`
    });
    
    return info;
};

const sendPasswordResetEmail = async (user, resetToken) => {
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    const info = await transporter.sendMail({
        from: `"Quizr Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset Request',
        text: `Click the link to reset your password: ${resetLink}. If you did not request this, please ignore this email. This link will expire in 1 hour.`,
        html: `<p>Hi ${user.username},</p><p>Click the link to reset your password: <a href="${resetLink}">Reset Password</a></p><p>If you did not request this, please ignore this email. This link will expire in 1 hour.</p>`
    });

    return info;
};

const sendPasswordChangedEmail = async (user) => {
    const info = await transporter.sendMail({
        from: `"Quizr Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your password has been changed',
        text: `Hi ${user.username}, your password has been successfully changed. If you did not perform this action, please contact our support immediately.`,
        html: `<p>Hi ${user.username},</p><p>Your password has been successfully changed. If you did not perform this action, please contact our support immediately.</p>`
    });

    return info;
};

module.exports = { sendConfirmationEmail, sendPasswordResetEmail, sendPasswordChangedEmail };
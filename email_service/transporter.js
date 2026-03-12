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

module.exports = sendConfirmationEmail;
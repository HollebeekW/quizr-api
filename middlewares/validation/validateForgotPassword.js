const { body } = require('express-validator');
const { handleValidation } = require('./handleValidation');

const validateForgotPassword = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    handleValidation
];

module.exports = { validateForgotPassword };

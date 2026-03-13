const { body } = require('express-validator');
const { handleValidation } = require('./handleValidation');

const validateLogin = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),
    
    handleValidation
];

module.exports = { validateLogin };

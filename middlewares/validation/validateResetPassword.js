const { body } = require('express-validator');
const { handleValidation } = require('./handleValidation');

const validateResetPassword = [
    body('newPassword')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    body('confirmNewPassword')
        .notEmpty().withMessage('Confirm Password is required')
        .isLength({ min: 6 }).withMessage('Confirm Password must be at least 6 characters long')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),

    handleValidation
];

module.exports = { validateResetPassword };
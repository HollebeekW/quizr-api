const router = require('express').Router();
const authController = require('../controllers/authController');
const { validateSignup } = require('../middlewares/validation/validateSignup');
const { validateLogin } = require('../middlewares/validation/validateLogin');
const { validateForgotPassword } = require('../middlewares/validation/validateForgotPassword');
const { validateResetPassword } = require('../middlewares/validation/validateResetPassword');

// Registration route
router.post('/signup', validateSignup, authController.register);

// Email verification route
router.get('/verify-email', authController.verifyEmail);

// Login route
router.post('/login', validateLogin, authController.login);

// Password reset request route
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

// Password reset route
router.post('/reset-password', validateResetPassword, authController.resetPassword);

module.exports = router;
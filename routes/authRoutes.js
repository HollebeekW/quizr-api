const router = require('express').Router();
const authController = require('../controllers/authController');
const { validateSignup } = require('../validation/authValidation');

// Registration route
router.post('/signup', validateSignup, authController.register);

// Email verification route
router.get('/verify-email', authController.verifyEmail);

// Login route
router.post('/login', authController.login);

// Password reset request route
router.post('/forgot-password', authController.forgotPassword);

// Password reset route
router.post('/reset-password', authController.resetPassword);

module.exports = router;
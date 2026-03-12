const router = require('express').Router();
const authController = require('../controllers/authController');
const { validateSignup } = require('../validation/authValidation');

// Registration route
router.post('/signup', validateSignup, authController.register);

// Email verification route
router.get('/verify-email', authController.verifyEmail);

module.exports = router;
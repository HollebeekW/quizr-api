const router = require('express').Router();
const authController = require('../controllers/authController');
const { validateSignup } = require('../validation/authValidation');

// Registration route
router.post('/signup', validateSignup, authController.register);

module.exports = router;
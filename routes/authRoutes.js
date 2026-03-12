const router = require('express').Router();
const authController = require('../controllers/authController');

// Registration route
router.post('/signup', authController.register);

module.exports = router;
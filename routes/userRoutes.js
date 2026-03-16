const router = require('express').Router();
const userController = require('../controllers/userController');
const { check: isAuthenticated }  = require('../middlewares/isAuthenticated');

// Get all users (protected route)
router.get('/', isAuthenticated, userController.getUsers);

// Get user by ID (protected route)
router.get('/:id', isAuthenticated, userController.getUserById);

// Update user password (protected route)
router.patch('/:id/update-password', isAuthenticated, userController.updatePassword);

// Update user email (protected route)
router.patch('/:id/update-email', isAuthenticated, userController.updateEmail);

module.exports = router;
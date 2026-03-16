const router = require('express').Router();
const userController = require('../controllers/userController');
const { check: isAuthenticated }  = require('../middlewares/isAuthenticated');

// Get all users (protected route)
router.get('/', isAuthenticated, userController.getUsers);

module.exports = router;
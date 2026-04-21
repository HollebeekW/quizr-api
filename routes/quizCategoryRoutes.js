const router = require('express').Router();
const quizCategoryController = require('../controllers/quizCategoryController');
const { check: isAuthenticated }  = require('../middlewares/isAuthenticated');

// Get all quiz categories
router.get('/', quizCategoryController.getQuizCategories);

// Get quiz category by ID
router.get('/:id', quizCategoryController.getQuizCategoryById);

module.exports = router;
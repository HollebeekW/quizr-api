const { sequelize, QuizCategory } = require('../database/database');

// GET: /api/quiz-categories
async function getQuizCategories(req, res) {
    try {
        const categories = await QuizCategory.findAll();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

//GET: /api/quiz-categories/:id
async function getQuizCategoryById(req, res) {
    try {
        const { id } = req.params;
        const category = await QuizCategory.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Quiz category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { getQuizCategories, getQuizCategoryById };
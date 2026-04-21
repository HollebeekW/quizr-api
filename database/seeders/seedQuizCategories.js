const { QuizCategory } = require('../database');

const DEFAULT_CATEGORIES = [
    {
        name: 'Science',
        description: 'Physics, chemistry, biology, and general science questions.'
    },

    {
        name: 'History',
        description: 'World history, events, people, and timelines.'
    },

    {
        name: 'Geography',
        description: 'Countries, capitals, landmarks, and world regions.'
    },

    {
        name: 'Music',
        description: 'Artists, albums, genres, and music history.'
    }
];

async function seedQuizCategories() {
    for (const category of DEFAULT_CATEGORIES) {
        await QuizCategory.findOrCreate({
            where: { name: category.name },
            defaults: category
        });
    }
}

module.exports = { seedQuizCategories };
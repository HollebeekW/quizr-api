require('dotenv').config();

const { sequelize, QuizCategory } = require('../database');
const { seedQuizCategories } = require('./seedQuizCategories');

async function runSeeders() {
    try {
        const isFreshMode = process.argv.includes('--fresh');

        if (isFreshMode && process.env.NODE_ENV !== 'development') {
            throw new Error('seed:fresh is allowed only when NODE_ENV=development');
        }

        await sequelize.sync();

        if (isFreshMode) {
            await QuizCategory.destroy({
                where: {},
                truncate: true
            });
        }

        await seedQuizCategories();

        if (isFreshMode) {
            console.log('Quiz categories cleared and reseeded successfully.');
        } else {
            console.log('Quiz categories seeded successfully.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

runSeeders();

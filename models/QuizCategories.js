const { DataTypes } = require('sequelize');

const QuizCategoriesModel = {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    //TODO: add image url for category icon
};

module.exports = (sequelize) => sequelize.define('quiz_categories', QuizCategoriesModel);
require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

app.get('/status', (req, res) => {
    res.json({
        status: 'Running',
        timestamp: new Date().toISOString()
    });
});

// Database setup
const { sequelize } = require('./database/database');

sequelize.sync({ })

// Uncomment the line below to reset the database during development (Warning: This will delete all existing data)
// sequelize.sync({ force: true })

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
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
const sequelize = require('./database/database');

// Initialise models
const User = require('./models/User')(sequelize);


sequelize.sync();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
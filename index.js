require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());

// CORS configuration
app.use(cors()); // Enable CORS for all ports !! REMOVE IN PRODUCTION !!

// Database setup
const { sequelize } = require('./database/database');

sequelize.sync({ })

// Uncomment the line below to reset the database during development (Warning: This will delete all existing data)
// sequelize.sync({ force: true })

// API Router
const apiRouter = express.Router();

apiRouter.get('/status', (req, res) => {
    res.json({
        status: 'Running',
        timestamp: new Date().toISOString()
    });
});

// Routes
const authRoutes = require('./routes/authRoutes');
apiRouter.use('/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
apiRouter.use('/users', userRoutes);

// Mount all API routes under /api
app.use('/api', apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
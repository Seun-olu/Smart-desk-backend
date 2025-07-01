require('./db');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');


const smartSuggestRoutes = require('./routes/smartSuggest');
const authRoutes = require('./routes/auth');

const app = express();

// CORS middleware for frontend communication
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(bodyParser.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route to serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/smart-suggest', smartSuggestRoutes);

// AI mode endpoint
app.get('/api/ai-mode', (req, res) => {
    res.json({ aiEnabled: process.env.USE_REAL_AI === 'true' && !!process.env.HF_API_KEY });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
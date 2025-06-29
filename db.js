const mongoose = require('mongoose');
require('dotenv').config();

// Use fallback URI if .env file is missing
const mongoURI = process.env.MONGODB_URL || 'mongodb://localhost:27017/smartdesk';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected!'))
.catch((err) => console.error('MongoDB connection error:', err));

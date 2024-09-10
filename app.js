require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const redisClient = require('./utils/redisClient');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('MongoDB connection error:', err);
});
app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.use('/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// Use Atlas only — require env var, fail fast if missing
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI not set in .env — aborting');
  process.exit(1);
}
console.log('Using MONGODB URI:', mongoUri);

mongoose.set('bufferCommands', false);

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('Connected to MongoDB Atlas. DB:', mongoose.connection.db?.databaseName, 'readyState:', mongoose.connection.readyState);
    app.listen(PORT, () => console.log(`Server running http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
    // Do not start server if Atlas unreachable
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Mount routes
const authRoutes = require('./routes/authRoutes');
const motorbikeRoutes = require('./routes/motorbikeRoutes');
const { authenticateToken } = require('./middleware/authMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/motorbikes', motorbikeRoutes);

// Main page routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login2.html'));
});

app.get('/homepage', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/homepage6.html'));
});

app.get('/admin', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

module.exports = app;
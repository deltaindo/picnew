require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const trainingRoutes = require('./routes/training');
const linkRoutes = require('./routes/links');
const registrationRoutes = require('./routes/registration');
const masterDataRoutes = require('./routes/master-data');
const publicRoutes = require('./routes/public');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/training', trainingRoutes);
app.use('/api/admin/links', linkRoutes);
app.use('/api/admin/registrations', registrationRoutes);
app.use('/api/admin/master-data', masterDataRoutes);
app.use('/api/public', publicRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`PIC App Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`${'='.repeat(50)}\n`);
});

module.exports = app;

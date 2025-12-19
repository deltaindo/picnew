require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./db');

// Import routes
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

// Test database connection on startup
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('\n❌ DATABASE CONNECTION FAILED');
    console.error('Error:', err.message);
    console.error('Connection details:');
    console.error('  Host:', process.env.DB_HOST || 'localhost');
    console.error('  Port:', process.env.DB_PORT || 5432);
    console.error('  Database:', process.env.DB_NAME || 'pic_app');
    console.error('  User:', process.env.DB_USER || 'postgres');
    console.error('\nFix: Make sure PostgreSQL is running and database exists');
  } else {
    console.log('✅ Database connected successfully');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    backend: 'running',
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'PIC App Backend API',
    version: '1.0.0',
    endpoints: {
      admin: [
        'POST   /api/admin/auth/init-admin - Initialize superadmin (once)',
        'POST   /api/admin/auth/login - Admin login',
        'GET    /api/admin/auth/status - Check initialization status',
        'GET    /api/admin/training - List trainings',
        'POST   /api/admin/training - Create training',
        'PUT    /api/admin/training/:id - Update training',
        'DELETE /api/admin/training/:id - Delete training',
        'GET    /api/admin/links - List registration links',
        'POST   /api/admin/links - Create registration link',
        'GET    /api/admin/registrations - List registrations',
      ],
      public: [
        'GET    /api/public/links/:token - Get form data (no auth)',
        'POST   /api/public/registrations - Submit registration (no auth)',
      ],
    },
  });
});

// API Routes
console.log('\n📋 Registering routes...');

app.use('/api/admin/auth', authRoutes);
console.log('✅ /api/admin/auth registered');

app.use('/api/admin/training', trainingRoutes);
console.log('✅ /api/admin/training registered');

app.use('/api/admin/links', linkRoutes);
console.log('✅ /api/admin/links registered');

app.use('/api/admin/registrations', registrationRoutes);
console.log('✅ /api/admin/registrations registered');

app.use('/api/admin/master-data', masterDataRoutes);
console.log('✅ /api/admin/master-data registered');

app.use('/api/public', publicRoutes);
console.log('✅ /api/public registered');

// Error handling middleware (MUST be after all routes)
app.use((err, req, res, next) => {
  console.error('\n❌ ERROR:');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler (MUST be last)
app.use((req, res) => {
  console.error('\n⚠️  404 - Route not found');
  console.error('Path:', req.path);
  console.error('Method:', req.method);

  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    hint: 'Check that you\'re using a valid endpoint. Try GET /api for available endpoints.',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 PIC App Backend`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Port:        ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database:    ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'pic_app'}`);
  console.log(`${'='.repeat(60)}`);
  console.log('\n📌 Test endpoints:');
  console.log(`   GET    http://localhost:${PORT}/health`);
  console.log(`   GET    http://localhost:${PORT}/api`);
  console.log('\n✅ Ready to receive requests!\n');
});

module.exports = app;

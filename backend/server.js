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

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
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
console.log('\n📋 Registering API routes...');

app.use('/api/admin/auth', authRoutes);
console.log('   ✅ /api/admin/auth');

app.use('/api/admin/training', trainingRoutes);
console.log('   ✅ /api/admin/training');

app.use('/api/admin/links', linkRoutes);
console.log('   ✅ /api/admin/links');

app.use('/api/admin/registrations', registrationRoutes);
console.log('   ✅ /api/admin/registrations');

app.use('/api/admin/master-data', masterDataRoutes);
console.log('   ✅ /api/admin/master-data');

app.use('/api/public', publicRoutes);
console.log('   ✅ /api/public');

// Error handling middleware (MUST be after all routes)
app.use((err, req, res, next) => {
  console.error('\n❌ ERROR HANDLER TRIGGERED');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Message:', err.message);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler (MUST be last)
app.use((req, res) => {
  console.error('\n⚠️  404 - Route not found');
  console.error('Requested:', `${req.method} ${req.path}`);

  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    hint: 'Check endpoint. Try GET /api for available endpoints.',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 PIC APP BACKEND - STARTED`);
  console.log(`${'='.repeat(70)}`);
  console.log(`\n📊 Configuration:`);
  console.log(`   Port:        ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database:    ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'pic_app'}`);
  console.log(`   Frontend:    ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`\n🔗 Test Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api`);
  console.log(`\n📋 Main API Routes:`);
  console.log(`   POST /api/admin/auth/init-admin`);
  console.log(`   POST /api/admin/auth/login`);
  console.log(`   GET  /api/admin/auth/status`);
  console.log(`   GET  /api/admin/training`);
  console.log(`   POST /api/admin/links`);
  console.log(`\n${'='.repeat(70)}`);
  console.log('✅ Ready to receive requests!\n');
});

module.exports = app;

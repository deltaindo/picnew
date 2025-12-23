/**
 * Centralized error handling middleware
 * Should be mounted LAST in the Express app
 */

const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = req.id || Math.random().toString(36).substr(2, 9);

  console.error(`\n❌ [ERROR] ${timestamp}`);
  console.error(`Request ID: ${requestId}`);
  console.error(`Path: ${req.method} ${req.path}`);
  console.error(`Message: ${err.message}`);
  console.error(`Stack:`, err.stack);

  // Database errors
  if (err.code === '23505') {
    // Unique constraint violation
    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_ENTRY',
      message: 'This record already exists',
      timestamp,
    });
  }

  if (err.code === '23503') {
    // Foreign key constraint violation
    return res.status(400).json({
      success: false,
      error: 'INVALID_REFERENCE',
      message: 'Referenced record does not exist',
      timestamp,
    });
  }

  if (err.code === '42P01') {
    // Table does not exist
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Database schema error - table not found',
      timestamp,
    });
  }

  if (err.code === 'ECONNREFUSED') {
    // Connection refused
    return res.status(503).json({
      success: false,
      error: 'DATABASE_UNAVAILABLE',
      message: 'Database connection failed',
      timestamp,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid or malformed token',
      timestamp,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'TOKEN_EXPIRED',
      message: 'Token has expired',
      timestamp,
    });
  }

  // Default error response
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : message,
    timestamp,
    ...(process.env.NODE_ENV === 'development' && { requestId, stack: err.stack }),
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
};

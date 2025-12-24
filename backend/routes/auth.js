const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { validateLogin, validateInitAdmin, handleValidationErrors } = require('../middleware/validate');

// Login with validation
router.post('/login', validateLogin, handleValidationErrors, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user from database
    const result = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Update lastLogin (camelCase - matches database column name)
    await pool.query(
      'UPDATE users SET "lastLogin" = NOW() WHERE id = $1',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Initialize admin (STRICTLY ONE-TIME ONLY) with validation
router.post('/init-admin', validateInitAdmin, handleValidationErrors, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if ANY users exist (strict enforcement)
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(usersResult.rows[0].count);

    if (userCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Admin already exists. System is already initialized. Cannot create another admin.',
      });
    }

    // Check if superadmin already exists
    const superadminResult = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = $1',
      ['superadmin']
    );
    
    if (parseInt(superadminResult.rows[0].count) > 0) {
      return res.status(403).json({
        success: false,
        message: 'Superadmin already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create superadmin user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, "lastLogin") 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, name, email, role`,
      [name || 'Superadmin', email, hashedPassword, 'super_admin']
    );

    const user = result.rows[0];

    // Generate token for immediate use
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Superadmin created successfully. System initialized.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Check system status (is admin initialized?)
router.get('/status', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(result.rows[0].count);

    const superadminResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE role = $1 LIMIT 1',
      ['super_admin']
    );

    res.json({
      success: true,
      data: {
        initialized: userCount > 0,
        user_count: userCount,
        superadmin: superadminResult.rows[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

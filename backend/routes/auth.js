const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
      });
    }

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

    // Update last_login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Initialize admin (STRICTLY ONE-TIME ONLY)
router.post('/init-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

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
      `INSERT INTO users (name, email, password, role, status, created_at, last_login) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING id, name, email, role`,
      [name || 'Superadmin', email, hashedPassword, 'superadmin', 'active']
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
    console.error('Init admin error:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Check system status (is admin initialized?)
router.get('/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(result.rows[0].count);

    const superadminResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE role = $1 LIMIT 1',
      ['superadmin']
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
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;

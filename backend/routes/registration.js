const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// List all registrations
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, link_id, trainee_name, email, phone, nik, company, position, status, created_at 
       FROM registrations 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Fetch registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get single registration
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM registrations WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Fetch registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Approve registration
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE registrations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['approved', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.json({
      success: true,
      message: 'Registration approved',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Approve registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Reject registration
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await pool.query(
      'UPDATE registrations SET status = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      ['rejected', reason || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.json({
      success: true,
      message: 'Registration rejected',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Reject registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;

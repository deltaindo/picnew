const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const auth = require('../middleware/auth');

// Generate unique token (auto link generator)
function generateToken() {
  return uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
}

// Generate unique link with token
function generateLink(token) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${baseUrl}/register/${token}`;
}

// List all registration links
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, token, training_id, 
        (SELECT name FROM trainings WHERE id = registration_links.training_id) as training_name,
        class_level, personnel_type, max_registrations, current_registrations,
        expiry_date, whatsapp_link, status, created_at
       FROM registration_links 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      message: 'Links fetched successfully',
      data: result.rows,
    });
  } catch (error) {
    console.error('Fetch links error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get single link
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM registration_links WHERE id = $1 OR token = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Link not found',
      });
    }

    const link = result.rows[0];
    link.share_url = generateLink(link.token);

    res.json({
      success: true,
      data: link,
    });
  } catch (error) {
    console.error('Fetch link error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Create registration link (AUTO GENERATOR)
router.post('/', auth, async (req, res) => {
  try {
    const {
      training_id,
      class_level,
      personnel_type,
      max_registrations = 25,
      expiry_date,
      whatsapp_link,
      required_documents = [],
    } = req.body;

    if (!training_id) {
      return res.status(400).json({
        success: false,
        message: 'training_id is required',
      });
    }

    // Generate unique token automatically
    const token = generateToken();
    const shareUrl = generateLink(token);

    const result = await pool.query(
      `INSERT INTO registration_links 
       (token, training_id, class_level, personnel_type, max_registrations, current_registrations, expiry_date, whatsapp_link, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 0, $6, $7, 'active', NOW())
       RETURNING *`,
      [
        token,
        training_id,
        class_level || null,
        personnel_type || null,
        max_registrations,
        expiry_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default: 90 days
        whatsapp_link || null,
      ]
    );

    const link = result.rows[0];
    link.share_url = shareUrl;

    res.json({
      success: true,
      message: 'Registration link created successfully',
      data: {
        ...link,
        share_url: shareUrl,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`,
      },
    });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Update registration link
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { class_level, personnel_type, max_registrations, expiry_date, whatsapp_link, status } = req.body;

    const updates = [];
    const values = [id];
    let paramCount = 2;

    if (class_level !== undefined) {
      updates.push(`class_level = $${paramCount++}`);
      values.push(class_level);
    }
    if (personnel_type !== undefined) {
      updates.push(`personnel_type = $${paramCount++}`);
      values.push(personnel_type);
    }
    if (max_registrations !== undefined) {
      updates.push(`max_registrations = $${paramCount++}`);
      values.push(max_registrations);
    }
    if (expiry_date !== undefined) {
      updates.push(`expiry_date = $${paramCount++}`);
      values.push(expiry_date);
    }
    if (whatsapp_link !== undefined) {
      updates.push(`whatsapp_link = $${paramCount++}`);
      values.push(whatsapp_link);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    const query = `UPDATE registration_links SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Link not found',
      });
    }

    const link = result.rows[0];
    link.share_url = generateLink(link.token);

    res.json({
      success: true,
      message: 'Link updated successfully',
      data: link,
    });
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Delete registration link
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM registration_links WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Link not found',
      });
    }

    res.json({
      success: true,
      message: 'Link deleted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;

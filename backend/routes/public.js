const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get registration form data for link token
router.get('/links/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Get link details
    const linkResult = await pool.query(
      `SELECT 
        rl.id, rl.token, rl.training_id, rl.class_level, rl.personnel_type, 
        rl.max_registrations, rl.current_registrations, rl.whatsapp_link,
        t.name as training_name, t.start_date, t.end_date, t.location, t.duration_days,
        t.instructor, t.description
       FROM registration_links rl
       JOIN trainings t ON rl.training_id = t.id
       WHERE rl.token = $1 AND rl.status = 'active'`,
      [token]
    );

    if (linkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration link not found or expired',
      });
    }

    const link = linkResult.rows[0];

    // Check if max registrations reached
    if (link.current_registrations >= link.max_registrations) {
      return res.status(400).json({
        success: false,
        message: 'Maximum registrations reached for this link',
      });
    }

    res.json({
      success: true,
      data: link,
    });
  } catch (error) {
    console.error('Get link error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Submit registration (public form submission)
router.post('/registrations', async (req, res) => {
  try {
    const {
      token,
      trainee_name,
      email,
      phone,
      nik,
      address,
      company,
      position,
    } = req.body;

    // Validation
    if (!token || !trainee_name || !email || !phone || !nik) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: token, trainee_name, email, phone, nik',
      });
    }

    // Get link ID from token
    const linkResult = await pool.query(
      'SELECT id, current_registrations, max_registrations FROM registration_links WHERE token = $1',
      [token]
    );

    if (linkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration link not found',
      });
    }

    const link = linkResult.rows[0];

    // Check registration limit
    if (link.current_registrations >= link.max_registrations) {
      return res.status(400).json({
        success: false,
        message: 'Maximum registrations reached',
      });
    }

    // Create registration
    const registrationResult = await pool.query(
      `INSERT INTO registrations (link_id, trainee_name, email, phone, nik, address, company, position, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'submitted', NOW())
       RETURNING id, trainee_name, email, link_id`,
      [
        link.id,
        trainee_name,
        email,
        phone,
        nik,
        address || null,
        company || null,
        position || null,
      ]
    );

    const registration = registrationResult.rows[0];

    // Update current registrations count
    await pool.query(
      'UPDATE registration_links SET current_registrations = current_registrations + 1 WHERE id = $1',
      [link.id]
    );

    res.json({
      success: true,
      message: 'Registration submitted successfully',
      data: {
        registration_id: registration.id,
        confirmation_email: registration.email,
        next_step: 'Please check your email for further instructions',
      },
    });
  } catch (error) {
    console.error('Submit registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Upload document (public)
router.post('/registrations/:registration_id/documents/upload', async (req, res) => {
  try {
    const { registration_id } = req.params;
    const { document_type, file_data, file_name } = req.body;

    if (!document_type || !file_data) {
      return res.status(400).json({
        success: false,
        message: 'document_type and file_data required',
      });
    }

    // TODO: Store file in S3/MinIO
    // For now, just record in database

    const result = await pool.query(
      `INSERT INTO registration_documents (registration_id, document_type, file_name, file_path, status, uploaded_at)
       VALUES ($1, $2, $3, $4, 'uploaded', NOW())
       RETURNING *`,
      [
        registration_id,
        document_type,
        file_name || 'document',
        `/uploads/${registration_id}/${document_type}`,
      ]
    );

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;

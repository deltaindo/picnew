const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// List all trainings
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, start_date, end_date, location, duration_days, max_participants, current_participants, instructor, status, created_at FROM trainings ORDER BY start_date DESC'
    );

    res.json({
      success: true,
      message: 'Trainings fetched successfully',
      data: result.rows,
    });
  } catch (error) {
    console.error('Fetch trainings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get single training
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM trainings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Training not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Fetch training error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Create training (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      start_date,
      end_date,
      location,
      duration_days,
      max_participants,
      instructor,
    } = req.body;

    // Validation
    if (!name || !start_date || !end_date || !location) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: name, start_date, end_date, location',
      });
    }

    const result = await pool.query(
      `INSERT INTO trainings (name, description, start_date, end_date, location, duration_days, max_participants, current_participants, instructor, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, 'scheduled', NOW())
       RETURNING *`,
      [
        name,
        description || null,
        start_date,
        end_date,
        location,
        duration_days || 0,
        max_participants || 25,
        instructor || 'TBD',
      ]
    );

    res.json({
      success: true,
      message: 'Training created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create training error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Update training (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, start_date, end_date, location, duration_days, max_participants, instructor, status } = req.body;

    // Build dynamic query
    const updates = [];
    const values = [id];
    let paramCount = 2;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(end_date);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }
    if (duration_days !== undefined) {
      updates.push(`duration_days = $${paramCount++}`);
      values.push(duration_days);
    }
    if (max_participants !== undefined) {
      updates.push(`max_participants = $${paramCount++}`);
      values.push(max_participants);
    }
    if (instructor !== undefined) {
      updates.push(`instructor = $${paramCount++}`);
      values.push(instructor);
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

    const query = `UPDATE trainings SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Training not found',
      });
    }

    res.json({
      success: true,
      message: 'Training updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update training error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Delete training (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // First, delete all registration links for this training
    await pool.query('DELETE FROM registration_links WHERE training_id = $1', [id]);

    // Then delete the training
    const result = await pool.query(
      'DELETE FROM trainings WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Training not found',
      });
    }

    res.json({
      success: true,
      message: 'Training deleted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Delete training error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const VALID_TYPES = ['bidang', 'classes', 'personnel_types', 'document_types'];

// List master data by type
router.get('/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`,
      });
    }

    const result = await pool.query(
      `SELECT id, name, code, description, created_at FROM ${type} ORDER BY name ASC`
    );

    res.json({
      success: true,
      type,
      data: result.rows,
    });
  } catch (error) {
    console.error('Fetch master data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Create master data item
router.post('/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { name, code, description } = req.body;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`,
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    const result = await pool.query(
      `INSERT INTO ${type} (name, code, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [name, code || null, description || null]
    );

    res.json({
      success: true,
      message: `${type} item created successfully`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create master data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Update master data item
router.put('/:type/:id', auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { name, code, description } = req.body;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`,
      });
    }

    const updates = [];
    const values = [id];
    let paramCount = 2;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (code !== undefined) {
      updates.push(`code = $${paramCount++}`);
      values.push(code);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    const query = `UPDATE ${type} SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update master data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Delete master data item
router.delete('/:type/:id', auth, async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`,
      });
    }

    const result = await pool.query(
      `DELETE FROM ${type} WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Delete master data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;

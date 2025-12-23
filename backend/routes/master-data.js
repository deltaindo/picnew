const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Map frontend types to actual database table names (PascalCase)
const TABLE_MAPPING = {
  'bidang': 'Bidang',
  'classes': 'TrainingClass',
  'personnel_types': 'PersonnelType',
  'document_types': 'DocumentType'
};

const VALID_TYPES = Object.keys(TABLE_MAPPING);

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

    const tableName = TABLE_MAPPING[type];
    const result = await pool.query(
      `SELECT id, name, description, "createdAt" FROM "${tableName}" ORDER BY name ASC`
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Create master data item
router.post('/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { name, description } = req.body;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`,
      });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    const tableName = TABLE_MAPPING[type];
    const result = await pool.query(
      `INSERT INTO "${tableName}" (name, description, "createdAt", "updatedAt") 
       VALUES ($1, $2, NOW(), NOW()) 
       RETURNING id, name, description, "createdAt"`,
      [name.trim(), description || null]
    );

    res.json({
      success: true,
      message: `${type} item created successfully`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create master data error:', error);
    
    // Check for specific database errors
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Name already exists',
        error: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const tableName = TABLE_MAPPING[type];
    const result = await pool.query(
      `DELETE FROM "${tableName}" WHERE id = $1 RETURNING id, name`,
      [parseInt(id)]
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
    
    // Check for foreign key constraint violations
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete item - it is referenced by other records',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
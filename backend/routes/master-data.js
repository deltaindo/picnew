const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Map frontend types to actual database table names (all snake_case)
const TABLE_MAPPING = {
  'bidang': 'bidang',
  'classes': 'training_classes',
  'training_programs': 'training_programs',
  'personnel_types': 'personnel_types',
  'document_types': 'document_types',
  'pic': 'pic',
  'marketing': 'marketing',
  'program_types': 'program_type'
};

// Column mapping - which columns exist for each table
const COLUMN_MAPPING = {
  'bidang': ['id', 'name', 'description', 'createdAt', 'updatedAt'],
  'training_classes': ['id', 'name', 'level', 'createdAt', 'updatedAt'],  // NO description!
  'training_programs': ['id', 'name', 'description', 'createdAt', 'updatedAt'],
  'personnel_types': ['id', 'name', 'createdAt', 'updatedAt'],  // NO description, NO level!
  'document_types': ['id', 'name', 'createdAt', 'updatedAt'],  // NO description, NO level!
  'pic': ['id', 'name', 'createdAt', 'updatedAt'],
  'marketing': ['id', 'name', 'createdAt', 'updatedAt'],
  'program_type': ['id', 'name', 'description', 'createdAt', 'updatedAt']
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
    
    // Build SELECT clause based on what columns actually exist
    let selectClause = 'id, name';
    if (tableName === 'bidang') {
      selectClause += ', description';
    } else if (tableName === 'training_classes') {
      selectClause += ', level';
    } else if (tableName === 'training_programs') {
      selectClause += ', description';
    } else if (tableName === 'program_type') {
      selectClause += ', description';
    }
    selectClause += ', "createdAt"';
    
    const result = await pool.query(
      `SELECT ${selectClause} FROM "${tableName}" ORDER BY name ASC`
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
    const { name, description, level } = req.body;

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
    let query = '';
    let params = [name.trim()];
    
    if (tableName === 'bidang') {
      // bidang has description
      query = `INSERT INTO "${tableName}" (name, description, "createdAt", "updatedAt") 
               VALUES ($1, $2, NOW(), NOW()) 
               RETURNING id, name, description, "createdAt"`;
      params.push(description || null);
    } else if (tableName === 'training_classes') {
      // training_classes has level, NOT description
      query = `INSERT INTO "${tableName}" (name, level, "createdAt", "updatedAt") 
               VALUES ($1, $2, NOW(), NOW()) 
               RETURNING id, name, level, "createdAt"`;
      params.push(level || 1);
    } else if (tableName === 'training_programs') {
      // training_programs has description
      query = `INSERT INTO "${tableName}" (name, description, "createdAt", "updatedAt") 
               VALUES ($1, $2, NOW(), NOW()) 
               RETURNING id, name, description, "createdAt"`;
      params.push(description || null);
    } else if (tableName === 'program_type') {
      // program_type has description
      query = `INSERT INTO "${tableName}" (name, description, "createdAt", "updatedAt") 
               VALUES ($1, $2, NOW(), NOW()) 
               RETURNING id, name, description, "createdAt"`;
      params.push(description || null);
    } else {
      // personnel_types, document_types, pic, marketing - only have name
      query = `INSERT INTO "${tableName}" (name, "createdAt", "updatedAt") 
               VALUES ($1, NOW(), NOW()) 
               RETURNING id, name, "createdAt"`;
    }
    
    const result = await pool.query(query, params);

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
    
    // Check for column not found error (42703) or table not found (42P01)
    if (error.code === '42703' || error.code === '42P01') {
      return res.status(400).json({
        success: false,
        message: 'Database schema error - table or column does not exist',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
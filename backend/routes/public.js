const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get registration form data for link token
router.get('/links/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Get link details with required documents
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

    // Get required documents for this link
    const docsResult = await pool.query(
      `SELECT dt.id, dt.name, dt.description
       FROM document_types dt
       JOIN link_required_documents lrd ON dt.id = lrd.document_id
       WHERE lrd.link_id = $1 AND lrd.is_required = true
       ORDER BY dt.name ASC`,
      [link.id]
    );

    // Get provinces for cascading dropdown
    const provincesResult = await pool.query(
      `SELECT id, name FROM provinces ORDER BY name ASC`
    );

    // Get education levels
    const educationResult = await pool.query(
      `SELECT id, name FROM education_levels ORDER BY name ASC`
    );

    const required_documents = docsResult.rows || [];
    const provinces = provincesResult.rows || [];
    const education_levels = educationResult.rows || [];

    res.json({
      success: true,
      data: {
        ...link,
        required_documents: required_documents,
        provinces: provinces,
        education_levels: education_levels,
      },
    });
  } catch (error) {
    console.error('Get link error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get districts for a province
router.get('/locations/districts/:province_id', async (req, res) => {
  try {
    const { province_id } = req.params;
    const result = await pool.query(
      `SELECT id, name FROM districts WHERE province_id = $1 ORDER BY name ASC`,
      [province_id]
    );
    res.json({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get subdistricts for a district
router.get('/locations/subdistricts/:district_id', async (req, res) => {
  try {
    const { district_id } = req.params;
    const result = await pool.query(
      `SELECT id, name FROM subdistricts WHERE district_id = $1 ORDER BY name ASC`,
      [district_id]
    );
    res.json({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('Get subdistricts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get villages for a subdistrict
router.get('/locations/villages/:subdistrict_id', async (req, res) => {
  try {
    const { subdistrict_id } = req.params;
    const result = await pool.query(
      `SELECT id, name FROM villages WHERE subdistrict_id = $1 ORDER BY name ASC`,
      [subdistrict_id]
    );
    res.json({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('Get villages error:', error);
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
      link_id,
      nama,
      ktp,
      tempat_lahir,
      tanggal_lahir,
      pendidikan,
      nama_sekolah,
      no_ijazah,
      tgl_ijazah,
      province_id,
      district_id,
      subdistrict_id,
      village_id,
      alamat_rumah,
      golongan_darah,
      wa,
      email,
      instansi,
      sektor,
      alamat_perusahaan,
      jabatan,
      tlp_kantor,
    } = req.body;

    // Validation
    if (!link_id || !nama || !ktp || !email || !wa) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: link_id, nama, ktp, email, wa',
      });
    }

    // Verify link exists and get its details
    const linkResult = await pool.query(
      'SELECT id, current_registrations, max_registrations FROM registration_links WHERE id = $1 AND status = \'active\'',
      [link_id]
    );

    if (linkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration link not found or inactive',
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

    // Create registration with all fields
    const registrationResult = await pool.query(
      `INSERT INTO registrations (
        link_id, full_name, email, phone, nik, 
        tempat_lahir, tanggal_lahir, pendidikan, nama_sekolah, no_ijazah, tgl_ijazah,
        province_id, district_id, subdistrict_id, village_id, alamat_rumah, golongan_darah, wa,
        company, position, instansi, sektor, alamat_perusahaan, jabatan, tlp_kantor,
        status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, 
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25,
        'submitted', NOW()
      )
      RETURNING id, full_name, email`,
      [
        link_id, nama, email, wa, ktp,
        tempat_lahir, tanggal_lahir, pendidikan, nama_sekolah, no_ijazah, tgl_ijazah,
        province_id, district_id, subdistrict_id, village_id, alamat_rumah, golongan_darah, wa,
        instansi, jabatan, instansi, sektor, alamat_perusahaan, jabatan, tlp_kantor,
      ]
    );

    const registration = registrationResult.rows[0];

    // Update current registrations count
    await pool.query(
      'UPDATE registration_links SET current_registrations = current_registrations + 1 WHERE id = $1',
      [link_id]
    );

    res.json({
      success: true,
      message: 'Registration submitted successfully',
      data: {
        registration_id: registration.id,
        confirmation_email: registration.email,
        next_step: 'Please check your email for further instructions and WhatsApp message',
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
    const { document_type_id, file_path, file_name, file_size, mime_type } = req.body;

    if (!document_type_id || !file_path) {
      return res.status(400).json({
        success: false,
        message: 'document_type_id and file_path required',
      });
    }

    const result = await pool.query(
      `INSERT INTO registration_documents (
        registration_id, document_type_id, file_path, file_name, file_size, mime_type, status, uploaded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'uploaded', NOW())
      ON CONFLICT (registration_id, document_type_id) 
      DO UPDATE SET file_path = $3, file_name = $4, file_size = $5, mime_type = $6
      RETURNING *`,
      [registration_id, document_type_id, file_path, file_name || 'document', file_size, mime_type]
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
const express = require('express');
const router = express.Router();

console.log('[Routes/Public] Loading...');
let prisma;
try {
  prisma = require('../prisma-client');
  console.log('[Routes/Public] ✅ Prisma client imported successfully');
} catch (err) {
  console.error('[Routes/Public] ❌ Failed to import prisma-client:', err.message);
  console.error(err);
}

if (!prisma) {
  console.error('[Routes/Public] ⚠️  CRITICAL: prisma is undefined!');
} else {
  console.log('[Routes/Public] ✅ prisma object is valid:', typeof prisma);
}

/**
 * GET /api/public/links/public/validate/:token
 * Validate registration link and return training info + dropdown options
 *
 * NOTE: We also keep a backwards-compatible alias:
 * GET /api/public/links/validate/:token
 */
const validateRegistrationLink = async (req, res) => {
  try {
    const { token } = req.params;
    console.log(`[Public] Validating registration link token: ${token}`);

    if (!prisma) {
      console.error('[Public] ERROR: prisma is undefined at request time');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Prisma client not available'
      });
    }

    const link = await prisma.registrationLink.findUnique({
      where: { uniqueToken: token },
      include: {
        trainingProgram: {
          select: { id: true, name: true, durationDays: true, bidangId: true }
        },
        trainingClass: {
          select: { id: true, name: true, level: true }
        },
        personnelType: {
          select: { id: true, name: true }
        }
      }
    });

    if (!link) {
      console.log(`[Public] Link not found for token: ${token}`);
      return res.status(404).json({
        success: false,
        message: 'Invalid registration link'
      });
    }

    console.log(`[Public] Link found: ${link.id}, Status: ${link.status}`);

    // Check if active
    if (link.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Link is ${link.status}. Cannot register.`
      });
    }

    // Check if expired
    if (new Date() > new Date(link.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Registration link has expired'
      });
    }

    // Check if full
    if (link.currentRegistrations >= link.maxRegistrations) {
      return res.status(400).json({
        success: false,
        message: 'This registration link has reached maximum capacity'
      });
    }

    // Get dropdown options
    const bidangOptions = await prisma.bidang.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });

    const allTrainingPrograms = await prisma.trainingProgram.findMany({
      select: { id: true, name: true, bidangId: true },
      orderBy: { name: 'asc' }
    });

    const trainingClasses = await prisma.trainingClass.findMany({
      select: { id: true, name: true, level: true },
      orderBy: { name: 'asc' }
    });

    const provinces = await prisma.province.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });

    // Note: educationLevel model doesn't exist in schema yet
    // For now, return empty array - frontend can provide hardcoded list or we add the model later
    const educationLevels = [];

    console.log('[Public] Returning link data with options');

    res.json({
      success: true,
      data: {
        id: link.id,
        uniqueToken: link.uniqueToken,
        training_name: link.trainingProgram?.name,
        class_level: link.trainingClass?.name,
        max_registrations: link.maxRegistrations,
        current_registrations: link.currentRegistrations,
        whatsapp_link: link.waGroupLink,
        bidang: bidangOptions,
        trainingPrograms: allTrainingPrograms,
        trainingClasses: trainingClasses,
        provinces: provinces,
        education_levels: educationLevels
      }
    });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Primary route (new)
router.get('/links/public/validate/:token', validateRegistrationLink);
// Backwards compatible route (old frontend)
router.get('/links/validate/:token', validateRegistrationLink);

/**
 * POST /api/public/registrations
 * Submit registration form data
 */
router.post('/registrations', async (req, res) => {
  try {
    const { token, nama, ktp, email, wa, ...otherFields } = req.body;
    console.log(`[Public] New registration submission with token: ${token}`);

    if (!prisma) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Verify link exists and is active
    const link = await prisma.registrationLink.findUnique({
      where: { uniqueToken: token }
    });

    if (!link || link.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Registration link not found or inactive'
      });
    }

    // Check capacity
    if (link.currentRegistrations >= link.maxRegistrations) {
      return res.status(400).json({
        success: false,
        message: 'Maximum registrations reached'
      });
    }

    // Create registration with Prisma
    const registration = await prisma.registration.create({
      data: {
        registrationLinkId: link.id,
        fullName: nama,
        email: email,
        phone: wa,
        nik: ktp,
        address: otherFields.alamat_rumah,
        bloodType: otherFields.golongan_darah,
        educationLevel: otherFields.pendidikan,
        companyName: otherFields.instansi,
        jobTitle: otherFields.jabatan
      }
    });

    // Update registration count
    await prisma.registrationLink.update({
      where: { id: link.id },
      data: { currentRegistrations: { increment: 1 } }
    });

    console.log(`[Public] Registration created: ${registration.id}`);

    res.json({
      success: true,
      message: 'Registration submitted successfully',
      data: {
        registration_id: registration.id,
        confirmation_email: registration.email
      }
    });
  } catch (error) {
    console.error('Submit registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

/**
 * GET /api/public/locations/regencies/:province_id
 * Get regencies by province (Level 2 hierarchy)
 * Schema: Province -> Regency -> District -> Village
 */
router.get('/locations/regencies/:province_id', async (req, res) => {
  try {
    const { province_id } = req.params;
    const regencies = await prisma.regency.findMany({
      where: { provinceId: parseInt(province_id) },
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: regencies || [] });
  } catch (error) {
    console.error('Get regencies error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/public/locations/districts/:regency_id
 * Get districts by regency (Level 3 hierarchy)
 * Schema: Province -> Regency -> District -> Village
 */
router.get('/locations/districts/:regency_id', async (req, res) => {
  try {
    const { regency_id } = req.params;
    const districts = await prisma.district.findMany({
      where: { regencyId: parseInt(regency_id) },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: districts || [] });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/public/locations/villages/:district_id
 * Get villages by district (Level 4 hierarchy)
 * Schema: Province -> Regency -> District -> Village
 */
router.get('/locations/villages/:district_id', async (req, res) => {
  try {
    const { district_id } = req.params;
    const villages = await prisma.village.findMany({
      where: { districtId: parseInt(district_id) },
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: villages || [] });
  } catch (error) {
    console.error('Get villages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/public/links/validate/:token
 * Validate registration link and return training info + dropdown options
 */
router.get('/links/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log(`[Public] Validating registration link token: ${token}`);

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

    const educationLevels = await prisma.educationLevel.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });

    console.log(`[Public] Returning link data with options`);

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
});

/**
 * POST /api/public/registrations
 * Submit registration form data
 */
router.post('/registrations', async (req, res) => {
  try {
    const { token, nama, ktp, email, wa, ...otherFields } = req.body;
    console.log(`[Public] New registration submission with token: ${token}`);

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
        tempatLahir: otherFields.tempat_lahir,
        tanggalLahir: otherFields.tanggal_lahir ? new Date(otherFields.tanggal_lahir) : null,
        pendidikan: otherFields.pendidikan,
        namaSekolah: otherFields.nama_sekolah,
        noIjazah: otherFields.no_ijazah,
        tglIjazah: otherFields.tgl_ijazah ? new Date(otherFields.tgl_ijazah) : null,
        provinceId: otherFields.province_id ? parseInt(otherFields.province_id) : null,
        districtId: otherFields.district_id ? parseInt(otherFields.district_id) : null,
        subDistrictId: otherFields.subdistrict_id ? parseInt(otherFields.subdistrict_id) : null,
        villageId: otherFields.village_id ? parseInt(otherFields.village_id) : null,
        alamatRumah: otherFields.alamat_rumah,
        golonganDarah: otherFields.golongan_darah,
        instansi: otherFields.instansi,
        sektor: otherFields.sektor,
        alamatPerusahaan: otherFields.alamat_perusahaan,
        jabatan: otherFields.jabatan,
        tlpKantor: otherFields.tlp_kantor,
        submissionStatus: 'submitted'
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
      message: 'Server error'
    });
  }
});

/**
 * GET /api/public/locations/districts/:province_id
 * Get districts by province
 */
router.get('/locations/districts/:province_id', async (req, res) => {
  try {
    const { province_id } = req.params;
    const districts = await prisma.district.findMany({
      where: { provinceId: parseInt(province_id) },
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
 * GET /api/public/locations/subdistricts/:district_id
 * Get subdistricts by district
 */
router.get('/locations/subdistricts/:district_id', async (req, res) => {
  try {
    const { district_id } = req.params;
    const subdistricts = await prisma.subDistrict.findMany({
      where: { districtId: parseInt(district_id) },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: subdistricts || [] });
  } catch (error) {
    console.error('Get subdistricts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/public/locations/villages/:subdistrict_id
 * Get villages by subdistrict
 */
router.get('/locations/villages/:subdistrict_id', async (req, res) => {
  try {
    const { subdistrict_id } = req.params;
    const villages = await prisma.village.findMany({
      where: { subDistrictId: parseInt(subdistrict_id) },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: villages || [] });
  } catch (error) {
    console.error('Get villages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
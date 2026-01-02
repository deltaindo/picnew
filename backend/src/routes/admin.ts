import { Router } from 'express';
import { login, me } from '../controllers/authController';
import {
  getTraining,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
} from '../controllers/trainingController';
import {
  getBidang,
  createBidang,
  updateBidang,
  deleteBidang,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getPersonnelTypes,
  createPersonnelType,
  getPIC,
  createPIC,
  updatePIC,
  deletePIC,
  getMarketing,
  createMarketing,
  updateMarketing,
  deleteMarketing,
  getProgramTypes,
  createProgramType,
  updateProgramType,
  deleteProgramType,
} from '../controllers/masterDataController';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/usersController';
import {
  getLinks,
  getLinkById,
  createLink,
  updateLink,
  deleteLink,
} from '../controllers/linksController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Auth routes (public)
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, me);

// Training routes (protected)
router.get('/training', authMiddleware, getTraining);
router.get('/training/:id', authMiddleware, getTrainingById);
router.post('/training', authMiddleware, createTraining);
router.put('/training/:id', authMiddleware, updateTraining);
router.delete('/training/:id', authMiddleware, deleteTraining);

// ============ USERS (ADMIN ACCOUNTS) ============
router.get('/users', authMiddleware, getUsers);
router.post('/users', authMiddleware, createUser);
router.put('/users/:id', authMiddleware, updateUser);
router.delete('/users/:id', authMiddleware, deleteUser);

// ============ REGISTRATION LINKS ============
router.get('/links', authMiddleware, getLinks);
router.get('/links/:id', authMiddleware, getLinkById);
router.post('/links', authMiddleware, createLink);
router.put('/links/:id', authMiddleware, updateLink);
router.delete('/links/:id', authMiddleware, deleteLink);

// ============ MASTER DATA ROUTES ============
// All master data endpoints grouped under /master-data/:type
// Convention: kebab-case for multi-word routes (REST standard)
// Supports: bidang, classes, personnel-types, pic, marketing, program-types, training-programs

// Bidang routes (with /master-data prefix)
router.get('/master-data/bidang', authMiddleware, getBidang);
router.post('/master-data/bidang', authMiddleware, createBidang);
router.put('/master-data/bidang/:id', authMiddleware, updateBidang);
router.delete('/master-data/bidang/:id', authMiddleware, deleteBidang);

// Classes routes (with /master-data prefix)
router.get('/master-data/classes', authMiddleware, getClasses);
router.post('/master-data/classes', authMiddleware, createClass);
router.put('/master-data/classes/:id', authMiddleware, updateClass);
router.delete('/master-data/classes/:id', authMiddleware, deleteClass);

// Personnel types routes (with /master-data prefix) - kebab-case
router.get('/master-data/personnel-types', authMiddleware, getPersonnelTypes);
router.post('/master-data/personnel-types', authMiddleware, createPersonnelType);

// PIC routes (with /master-data prefix)
router.get('/master-data/pic', authMiddleware, getPIC);
router.post('/master-data/pic', authMiddleware, createPIC);
router.put('/master-data/pic/:id', authMiddleware, updatePIC);
router.delete('/master-data/pic/:id', authMiddleware, deletePIC);

// Marketing routes (with /master-data prefix)
router.get('/master-data/marketing', authMiddleware, getMarketing);
router.post('/master-data/marketing', authMiddleware, createMarketing);
router.put('/master-data/marketing/:id', authMiddleware, updateMarketing);
router.delete('/master-data/marketing/:id', authMiddleware, deleteMarketing);

// Program Types routes (with /master-data prefix) - kebab-case
router.get('/master-data/program-types', authMiddleware, getProgramTypes);
router.post('/master-data/program-types', authMiddleware, createProgramType);
router.put('/master-data/program-types/:id', authMiddleware, updateProgramType);
router.delete('/master-data/program-types/:id', authMiddleware, deleteProgramType);

// Training Programs routes (with /master-data prefix) - kebab-case
router.get('/master-data/training-programs', authMiddleware, async (req, res) => {
  try {
    const { prisma } = require('../utils/prisma');
    const { page = 1, limit = 100 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [total, data] = await Promise.all([
      prisma.trainingProgram.count(),
      prisma.trainingProgram.findMany({
        skip,
        take: Number(limit),
        include: {
          bidang: true,
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    console.error('Get training programs error:', error);
    res.status(500).json({ error: 'Failed to get training programs' });
  }
});

// ============ LEGACY & DEPRECATED ROUTES ============
// Keep for backward compatibility - these are deprecated, use /master-data/* instead

router.get('/bidang', authMiddleware, getBidang);
router.post('/bidang', authMiddleware, createBidang);
router.put('/bidang/:id', authMiddleware, updateBidang);
router.delete('/bidang/:id', authMiddleware, deleteBidang);

router.get('/classes', authMiddleware, getClasses);
router.post('/classes', authMiddleware, createClass);
router.put('/classes/:id', authMiddleware, updateClass);
router.delete('/classes/:id', authMiddleware, deleteClass);

// Deprecated: /personnel-types and /personnel_types - use /master-data/personnel-types
router.get('/personnel-types', authMiddleware, getPersonnelTypes);
router.post('/personnel-types', authMiddleware, createPersonnelType);

export default router;
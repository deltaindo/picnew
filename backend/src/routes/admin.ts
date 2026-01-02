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
// Supports: bidang, classes, personnel-types, pic, marketing, program-types

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

// Personnel types routes (with /master-data prefix)
router.get('/master-data/personnel_types', authMiddleware, getPersonnelTypes);
router.post('/master-data/personnel_types', authMiddleware, createPersonnelType);

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

// Program Types routes (with /master-data prefix)
router.get('/master-data/program_types', authMiddleware, getProgramTypes);
router.post('/master-data/program_types', authMiddleware, createProgramType);
router.put('/master-data/program_types/:id', authMiddleware, updateProgramType);
router.delete('/master-data/program_types/:id', authMiddleware, deleteProgramType);

// Legacy routes (keep for backward compatibility)
router.get('/bidang', authMiddleware, getBidang);
router.post('/bidang', authMiddleware, createBidang);
router.put('/bidang/:id', authMiddleware, updateBidang);
router.delete('/bidang/:id', authMiddleware, deleteBidang);

router.get('/classes', authMiddleware, getClasses);
router.post('/classes', authMiddleware, createClass);
router.put('/classes/:id', authMiddleware, updateClass);
router.delete('/classes/:id', authMiddleware, deleteClass);

router.get('/personnel-types', authMiddleware, getPersonnelTypes);
router.post('/personnel-types', authMiddleware, createPersonnelType);

export default router;

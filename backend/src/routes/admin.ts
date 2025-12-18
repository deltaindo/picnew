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
} from '../controllers/masterDataController';
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

// Bidang routes
router.get('/bidang', authMiddleware, getBidang);
router.post('/bidang', authMiddleware, createBidang);
router.put('/bidang/:id', authMiddleware, updateBidang);
router.delete('/bidang/:id', authMiddleware, deleteBidang);

// Classes routes
router.get('/classes', authMiddleware, getClasses);
router.post('/classes', authMiddleware, createClass);
router.put('/classes/:id', authMiddleware, updateClass);
router.delete('/classes/:id', authMiddleware, deleteClass);

// Personnel types routes
router.get('/personnel-types', authMiddleware, getPersonnelTypes);
router.post('/personnel-types', authMiddleware, createPersonnelType);

export default router;

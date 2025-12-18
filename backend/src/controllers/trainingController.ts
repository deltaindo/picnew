import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// GET /api/admin/training
export const getTraining = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, bidangId, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (bidangId) where.bidangId = Number(bidangId);
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.trainingProgram.count({ where }),
      prisma.trainingProgram.findMany({
        where,
        include: { bidang: true },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    logger.error('Get training error:', error);
    res.status(500).json({ error: 'Failed to get training programs' });
  }
};

// GET /api/admin/training/:id
export const getTrainingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const training = await prisma.trainingProgram.findUnique({
      where: { id: Number(id) },
      include: { bidang: true, links: { select: { id: true, currentRegistrations: true, maxRegistrations: true } } },
    });

    if (!training) {
      return res.status(404).json({ error: 'Training program not found' });
    }

    res.json({ success: true, data: training });
  } catch (error) {
    logger.error('Get training by id error:', error);
    res.status(500).json({ error: 'Failed to get training program' });
  }
};

// POST /api/admin/training
export const createTraining = async (req: Request, res: Response) => {
  try {
    const { name, description, bidangId, durationDays, minParticipants, maxParticipants } = req.body;

    if (!name || !bidangId) {
      return res.status(400).json({ error: 'Name and bidang required' });
    }

    const training = await prisma.trainingProgram.create({
      data: {
        name,
        description,
        bidangId: Number(bidangId),
        durationDays: Number(durationDays) || 5,
        minParticipants: Number(minParticipants) || 8,
        maxParticipants: Number(maxParticipants) || 25,
      },
      include: { bidang: true },
    });

    logger.info(`Training program created: ${training.name}`);

    res.status(201).json({ success: true, data: training });
  } catch (error: any) {
    logger.error('Create training error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Training program already exists' });
    }
    res.status(500).json({ error: 'Failed to create training program' });
  }
};

// PUT /api/admin/training/:id
export const updateTraining = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, bidangId, durationDays, minParticipants, maxParticipants, status } = req.body;

    const training = await prisma.trainingProgram.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(bidangId && { bidangId: Number(bidangId) }),
        ...(durationDays && { durationDays: Number(durationDays) }),
        ...(minParticipants !== undefined && { minParticipants: Number(minParticipants) }),
        ...(maxParticipants !== undefined && { maxParticipants: Number(maxParticipants) }),
        ...(status && { status }),
      },
      include: { bidang: true },
    });

    logger.info(`Training program updated: ${training.name}`);

    res.json({ success: true, data: training });
  } catch (error: any) {
    logger.error('Update training error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Training program not found' });
    }
    res.status(500).json({ error: 'Failed to update training program' });
  }
};

// DELETE /api/admin/training/:id
export const deleteTraining = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.trainingProgram.update({
      where: { id: Number(id) },
      data: { status: 'inactive' },
    });

    logger.info(`Training program deleted: ${id}`);

    res.json({ success: true, message: 'Training program deleted' });
  } catch (error: any) {
    logger.error('Delete training error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Training program not found' });
    }
    res.status(500).json({ error: 'Failed to delete training program' });
  }
};

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// ============ BIDANG ============

export const getBidang = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [total, data] = await Promise.all([
      prisma.bidang.count(),
      prisma.bidang.findMany({
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    logger.error('Get bidang error:', error);
    res.status(500).json({ error: 'Failed to get bidang' });
  }
};

export const createBidang = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }

    const bidang = await prisma.bidang.create({
      data: { name, description },
    });

    logger.info(`Bidang created: ${bidang.name}`);

    res.status(201).json({ success: true, data: bidang });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bidang already exists' });
    }
    res.status(500).json({ error: 'Failed to create bidang' });
  }
};

export const updateBidang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const bidang = await prisma.bidang.update({
      where: { id: Number(id) },
      data: { ...(name && { name }), ...(description && { description }) },
    });

    logger.info(`Bidang updated: ${bidang.name}`);

    res.json({ success: true, data: bidang });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Bidang not found' });
    }
    res.status(500).json({ error: 'Failed to update bidang' });
  }
};

export const deleteBidang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if bidang is in use
    const inUse = await prisma.trainingProgram.count({ where: { bidangId: Number(id) } });
    if (inUse > 0) {
      return res.status(400).json({ error: 'Cannot delete bidang in use' });
    }

    await prisma.bidang.delete({ where: { id: Number(id) } });

    logger.info(`Bidang deleted: ${id}`);

    res.json({ success: true, message: 'Bidang deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Bidang not found' });
    }
    res.status(500).json({ error: 'Failed to delete bidang' });
  }
};

// ============ CLASSES ============

export const getClasses = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [total, data] = await Promise.all([
      prisma.trainingClass.count(),
      prisma.trainingClass.findMany({
        skip,
        take: Number(limit),
        orderBy: { level: 'desc' },
      }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    logger.error('Get classes error:', error);
    res.status(500).json({ error: 'Failed to get classes' });
  }
};

export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, level } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }

    const trainingClass = await prisma.trainingClass.create({
      data: { name, level: Number(level) || 1 },
    });

    logger.info(`Class created: ${trainingClass.name}`);

    res.status(201).json({ success: true, data: trainingClass });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Class already exists' });
    }
    res.status(500).json({ error: 'Failed to create class' });
  }
};

export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, level } = req.body;

    const trainingClass = await prisma.trainingClass.update({
      where: { id: Number(id) },
      data: { ...(name && { name }), ...(level !== undefined && { level: Number(level) }) },
    });

    logger.info(`Class updated: ${trainingClass.name}`);

    res.json({ success: true, data: trainingClass });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.status(500).json({ error: 'Failed to update class' });
  }
};

export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if class is in use
    const inUse = await prisma.registrationLink.count({ where: { trainingClassId: Number(id) } });
    if (inUse > 0) {
      return res.status(400).json({ error: 'Cannot delete class in use' });
    }

    await prisma.trainingClass.delete({ where: { id: Number(id) } });

    logger.info(`Class deleted: ${id}`);

    res.json({ success: true, message: 'Class deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.status(500).json({ error: 'Failed to delete class' });
  }
};

// ============ PERSONNEL TYPES ============

export const getPersonnelTypes = async (req: Request, res: Response) => {
  try {
    const data = await prisma.personnelType.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Get personnel types error:', error);
    res.status(500).json({ error: 'Failed to get personnel types' });
  }
};

export const createPersonnelType = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }

    const personnelType = await prisma.personnelType.create({ data: { name } });

    logger.info(`Personnel type created: ${personnelType.name}`);

    res.status(201).json({ success: true, data: personnelType });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Personnel type already exists' });
    }
    res.status(500).json({ error: 'Failed to create personnel type' });
  }
};

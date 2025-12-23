import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Error handler utility
const handleError = (error: any, res: Response, context: string) => {
  logger.error(`${context} error:`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
  });

  if (error.code === 'P2002') {
    return res.status(400).json({ error: 'Record already exists' });
  }
  if (error.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  if (error.code === 'P2003') {
    return res.status(400).json({ error: 'Foreign key constraint failed' });
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

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
    handleError(error, res, 'Get bidang');
  }
};

export const createBidang = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const bidang = await prisma.bidang.create({
      data: { name: name.trim(), description: description?.trim() || null },
    });

    logger.info(`Bidang created: ${bidang.name}`);

    res.status(201).json({ success: true, data: bidang });
  } catch (error: any) {
    handleError(error, res, 'Create bidang');
  }
};

export const updateBidang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const bidang = await prisma.bidang.update({
      where: { id: Number(id) },
      data: { 
        ...(name && { name: name.trim() }), 
        ...(description !== undefined && { description: description?.trim() || null }) 
      },
    });

    logger.info(`Bidang updated: ${bidang.name}`);

    res.json({ success: true, data: bidang });
  } catch (error: any) {
    handleError(error, res, 'Update bidang');
  }
};

export const deleteBidang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // Check if bidang is in use
    const inUse = await prisma.trainingProgram.count({ where: { bidangId: Number(id) } });
    if (inUse > 0) {
      return res.status(400).json({ error: 'Cannot delete bidang in use' });
    }

    await prisma.bidang.delete({ where: { id: Number(id) } });

    logger.info(`Bidang deleted: ${id}`);

    res.json({ success: true, message: 'Bidang deleted' });
  } catch (error: any) {
    handleError(error, res, 'Delete bidang');
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
    handleError(error, res, 'Get classes');
  }
};

export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, level } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const trainingClass = await prisma.trainingClass.create({
      data: { name: name.trim(), level: Number(level) || 1 },
    });

    logger.info(`Class created: ${trainingClass.name}`);

    res.status(201).json({ success: true, data: trainingClass });
  } catch (error: any) {
    handleError(error, res, 'Create class');
  }
};

export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, level } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const trainingClass = await prisma.trainingClass.update({
      where: { id: Number(id) },
      data: { 
        ...(name && { name: name.trim() }), 
        ...(level !== undefined && { level: Number(level) }) 
      },
    });

    logger.info(`Class updated: ${trainingClass.name}`);

    res.json({ success: true, data: trainingClass });
  } catch (error: any) {
    handleError(error, res, 'Update class');
  }
};

export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // Check if class is in use
    const inUse = await prisma.registrationLink.count({ where: { trainingClassId: Number(id) } });
    if (inUse > 0) {
      return res.status(400).json({ error: 'Cannot delete class in use' });
    }

    await prisma.trainingClass.delete({ where: { id: Number(id) } });

    logger.info(`Class deleted: ${id}`);

    res.json({ success: true, message: 'Class deleted' });
  } catch (error: any) {
    handleError(error, res, 'Delete class');
  }
};

// ============ PERSONNEL TYPES ============

export const getPersonnelTypes = async (req: Request, res: Response) => {
  try {
    const data = await prisma.personnelType.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res, 'Get personnel types');
  }
};

export const createPersonnelType = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const personnelType = await prisma.personnelType.create({ data: { name: name.trim() } });

    logger.info(`Personnel type created: ${personnelType.name}`);

    res.status(201).json({ success: true, data: personnelType });
  } catch (error: any) {
    handleError(error, res, 'Create personnel type');
  }
};

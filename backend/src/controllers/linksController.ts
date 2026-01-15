import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import logger from '../utils/logger';

// GET /api/admin/links - List all registration links with filters
export const getLinks = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, trainingProgramId, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (trainingProgramId) where.trainingProgramId = Number(trainingProgramId);
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.registrationLink.count({ where }),
      prisma.registrationLink.findMany({
        where,
        include: {
          trainingProgram: true,
          trainingClass: true,
          personnelType: true,
          pic: true,
          marketing: true,
          programType: true,
          createdByAdmin: { select: { id: true, name: true, email: true } },
        },
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
    logger.error('Get links error:', error);
    res.status(500).json({ error: 'Failed to get registration links' });
  }
};

// GET /api/admin/links/:id - Get single link details
export const getLinkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const link = await prisma.registrationLink.findUnique({
      where: { id: Number(id) },
      include: {
        trainingProgram: true,
        trainingClass: true,
        personnelType: true,
        pic: true,
        marketing: true,
        programType: true,
        createdByAdmin: { select: { id: true, name: true, email: true } },
        registrations: { select: { id: true, fullName: true, email: true, submissionStatus: true } },
      },
    });

    if (!link) {
      return res.status(404).json({ error: 'Registration link not found' });
    }

    res.json({ success: true, data: link });
  } catch (error) {
    logger.error('Get link by id error:', error);
    res.status(500).json({ error: 'Failed to get registration link' });
  }
};

// POST /api/admin/links - Create new registration link
export const createLink = async (req: Request, res: Response) => {
  try {
    const { trainingProgramId, trainingClassId, personnelTypeId, picId, marketingId, programTypeId, tanggalPelaksanaan, tanggalSelesai, maxRegistrations, expiryDate, waGroupLink } = req.body;
    const userId = (req as any).user?.id;

    // Validation
    if (!trainingProgramId || !trainingClassId || !personnelTypeId || !expiryDate) {
      return res.status(400).json({
        error: 'trainingProgramId, trainingClassId, personnelTypeId, and expiryDate are required',
      });
    }

    // Verify training program exists
    const trainingProgram = await prisma.trainingProgram.findUnique({
      where: { id: Number(trainingProgramId) },
    });

    if (!trainingProgram) {
      return res.status(404).json({ error: 'Training program not found' });
    }

    // Verify training class exists
    const trainingClass = await prisma.trainingClass.findUnique({
      where: { id: Number(trainingClassId) },
    });

    if (!trainingClass) {
      return res.status(404).json({ error: 'Training class not found' });
    }

    // Verify personnel type exists
    const personnelType = await prisma.personnelType.findUnique({
      where: { id: Number(personnelTypeId) },
    });

    if (!personnelType) {
      return res.status(404).json({ error: 'Personnel type not found' });
    }

    const link = await prisma.registrationLink.create({
      data: {
        trainingProgramId: Number(trainingProgramId),
        trainingClassId: Number(trainingClassId),
        personnelTypeId: Number(personnelTypeId),
        picId: picId ? Number(picId) : null,
        marketingId: marketingId ? Number(marketingId) : null,
        programTypeId: programTypeId ? Number(programTypeId) : null,
        tanggalPelaksanaan: tanggalPelaksanaan ? new Date(tanggalPelaksanaan) : null,
        tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
        maxRegistrations: Number(maxRegistrations) || 25,
        expiryDate: new Date(expiryDate),
        waGroupLink: waGroupLink || null,
        createdByAdminId: userId,
      },
      include: {
        trainingProgram: true,
        trainingClass: true,
        personnelType: true,
        pic: true,
        marketing: true,
        programType: true,
        createdByAdmin: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Registration link created: ${link.uniqueToken}`);
    res.status(201).json({ success: true, data: link });
  } catch (error: any) {
    logger.error('Create link error:', error);
    res.status(500).json({ error: 'Failed to create registration link', details: error.message });
  }
};

// PUT /api/admin/links/:id - Update registration link
export const updateLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { trainingProgramId, trainingClassId, personnelTypeId, picId, marketingId, programTypeId, tanggalPelaksanaan, tanggalSelesai, maxRegistrations, expiryDate, waGroupLink, status } = req.body;

    // Build update data object
    const updateData: any = {};
    if (trainingProgramId) updateData.trainingProgramId = Number(trainingProgramId);
    if (trainingClassId) updateData.trainingClassId = Number(trainingClassId);
    if (personnelTypeId) updateData.personnelTypeId = Number(personnelTypeId);
    if (picId !== undefined) updateData.picId = picId ? Number(picId) : null;
    if (marketingId !== undefined) updateData.marketingId = marketingId ? Number(marketingId) : null;
    if (programTypeId !== undefined) updateData.programTypeId = programTypeId ? Number(programTypeId) : null;
    if (tanggalPelaksanaan !== undefined) updateData.tanggalPelaksanaan = tanggalPelaksanaan ? new Date(tanggalPelaksanaan) : null;
    if (tanggalSelesai !== undefined) updateData.tanggalSelesai = tanggalSelesai ? new Date(tanggalSelesai) : null;
    if (maxRegistrations) updateData.maxRegistrations = Number(maxRegistrations);
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);
    if (waGroupLink !== undefined) updateData.waGroupLink = waGroupLink || null;
    if (status) updateData.status = status;

    const link = await prisma.registrationLink.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        trainingProgram: true,
        trainingClass: true,
        personnelType: true,
        pic: true,
        marketing: true,
        programType: true,
        createdByAdmin: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Registration link updated: ${link.uniqueToken}`);
    res.json({ success: true, data: link });
  } catch (error: any) {
    logger.error('Update link error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Registration link not found' });
    }
    res.status(500).json({ error: 'Failed to update registration link' });
  }
};

// DELETE /api/admin/links/:id - Delete registration link
export const deleteLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.registrationLink.delete({
      where: { id: Number(id) },
    });

    logger.info(`Registration link deleted: ${id}`);
    res.json({ success: true, message: 'Registration link deleted' });
  } catch (error: any) {
    logger.error('Delete link error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Registration link not found' });
    }
    res.status(500).json({ error: 'Failed to delete registration link' });
  }
};

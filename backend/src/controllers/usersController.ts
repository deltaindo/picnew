import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

// Error handler utility
const handleError = (error: any, res: Response, context: string) => {
  logger.error(`${context} error:`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
  });

  if (error.code === 'P2002') {
    return res.status(400).json({ error: 'Email already exists' });
  }
  if (error.code === 'P2025') {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

// ============ USERS (ADMIN ACCOUNTS) ============

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [total, data] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: Number(limit),
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Map data to match frontend interface
    const mappedData = data.map((user) => ({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as 'super_admin' | 'admin' | 'moderator',
      status: 'active',
      last_login: null,
      created_at: user.createdAt.toISOString(),
      permissions: user.role === 'super_admin' ? ['*'] : user.role === 'admin' ? ['read', 'write', 'delete'] : ['read'],
    }));

    res.json({
      success: true,
      data: mappedData,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    handleError(error, res, 'Get users');
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!['super_admin', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    logger.info(`User created: ${user.email}`);

    res.status(201).json({
      success: true,
      data: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as 'super_admin' | 'admin' | 'moderator',
        status: 'active',
        created_at: user.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    handleError(error, res, 'Create user');
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    if (role && !['super_admin', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(role && { role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    logger.info(`User updated: ${user.email}`);

    res.json({
      success: true,
      data: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as 'super_admin' | 'admin' | 'moderator',
        status: 'active',
        created_at: user.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    handleError(error, res, 'Update user');
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // Check if user has created registration links
    const linksCount = await prisma.registrationLink.count({ where: { createdByAdminId: Number(id) } });
    if (linksCount > 0) {
      return res.status(400).json({ error: 'Cannot delete user with existing registration links' });
    }

    const user = await prisma.user.delete({
      where: { id: Number(id) },
      select: { email: true },
    });

    logger.info(`User deleted: ${user.email}`);

    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    handleError(error, res, 'Delete user');
  }
};

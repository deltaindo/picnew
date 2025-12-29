const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate registration link from token
 */
function generateLink(token) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${baseUrl}/register/${token}`;
}

/**
 * Generate QR code URL
 */
function generateQRCode(link) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
}

/**
 * Format link response with additional data
 */
function formatLinkResponse(link) {
  const shareUrl = generateLink(link.uniqueToken);
  return {
    ...link,
    share_url: shareUrl,
    qr_code_url: generateQRCode(shareUrl)
  };
}

// ==================== ROUTES ====================

/**
 * GET /api/admin/links
 * Get all registration links with related data
 */
router.get('/', auth, async (req, res) => {
  try {
    const links = await prisma.registrationLink.findMany({
      include: {
        trainingProgram: {
          select: {
            id: true,
            name: true,
            durationDays: true,
            bidangId: true
          }
        },
        trainingClass: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        personnelType: {
          select: {
            id: true,
            name: true
          }
        },
        createdByAdmin: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response with share URLs
    const formattedLinks = links.map(formatLinkResponse);

    res.json({
      success: true,
      message: 'Links fetched successfully',
      data: formattedLinks,
      total: links.length
    });
  } catch (error) {
    console.error('Fetch links error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch links',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/admin/links/:id
 * Get single link by ID or token
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const linkId = parseInt(id);

    // Try to find by ID first, then by token
    let link = await prisma.registrationLink.findFirst({
      where: {
        OR: [
          { id: isNaN(linkId) ? undefined : linkId },
          { uniqueToken: id }
        ]
      },
      include: {
        trainingProgram: true,
        trainingClass: true,
        personnelType: true,
        createdByAdmin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        registrations: {
          select: {
            id: true,
            fullName: true,
            email: true,
            submissionStatus: true,
            submittedAt: true
          }
        }
      }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    res.json({
      success: true,
      data: formatLinkResponse(link)
    });
  } catch (error) {
    console.error('Fetch link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch link',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/admin/links
 * Create new registration link
 * 
 * Required fields in request body:
 * - trainingProgramId (integer)
 * - trainingClassId (integer)
 * - personnelTypeId (integer)
 * - maxRegistrations (integer)
 * - expiryDate (ISO datetime string)
 * 
 * Optional fields:
 * - waGroupLink (string)
 * - requiredDocuments (array of objects)
 */
router.post('/', auth, async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const {
      trainingProgramId,
      trainingClassId,
      personnelTypeId,
      maxRegistrations = 25,
      expiryDate,
      waGroupLink,
      requiredDocuments = []
    } = req.body;

    // ==================== VALIDATION ====================

    // Validate required fields
    if (!trainingProgramId) {
      return res.status(400).json({
        success: false,
        message: 'trainingProgramId is required'
      });
    }

    if (!trainingClassId) {
      return res.status(400).json({
        success: false,
        message: 'trainingClassId is required'
      });
    }

    if (!personnelTypeId) {
      return res.status(400).json({
        success: false,
        message: 'personnelTypeId is required'
      });
    }

    if (!maxRegistrations || maxRegistrations <= 0) {
      return res.status(400).json({
        success: false,
        message: 'maxRegistrations must be greater than 0'
      });
    }

    if (!expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'expiryDate is required'
      });
    }

    // Validate that expiry date is in the future
    const expiry = new Date(expiryDate);
    if (expiry <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'expiryDate must be in the future'
      });
    }

    // ==================== CREATE LINK ====================

    // Create link with Prisma
    const link = await prisma.registrationLink.create({
      data: {
        uniqueToken: uuidv4(),
        trainingProgramId: parseInt(trainingProgramId),
        trainingClassId: parseInt(trainingClassId),
        personnelTypeId: parseInt(personnelTypeId),
        createdByAdminId: userId,
        maxRegistrations: parseInt(maxRegistrations),
        currentRegistrations: 0,
        expiryDate: expiry,
        waGroupLink: waGroupLink || null,
        status: 'active',
        
        // Add required documents if provided
        ...(requiredDocuments.length > 0 && {
          requiredDocuments: {
            createMany: {
              data: requiredDocuments.map(doc => ({
                documentType: doc.documentType,
                displayName: doc.displayName,
                isRequired: doc.isRequired !== false
              }))
            }
          }
        })
      },
      include: {
        trainingProgram: {
          select: {
            id: true,
            name: true,
            durationDays: true
          }
        },
        trainingClass: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        personnelType: {
          select: {
            id: true,
            name: true
          }
        },
        createdByAdmin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Registration link created successfully',
      data: formatLinkResponse(link)
    });
  } catch (error) {
    console.error('Create link error:', error);

    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      // Record not found
      return res.status(400).json({
        success: false,
        message: 'Training program, class, or personnel type not found'
      });
    }

    if (error.code === 'P2014') {
      // Foreign key constraint failed
      return res.status(400).json({
        success: false,
        message: 'Invalid training program, class, or personnel type ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create link',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/admin/links/:id
 * Update registration link
 * 
 * Can update:
 * - maxRegistrations
 * - expiryDate
 * - waGroupLink
 * - status (active, expired, filled)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { maxRegistrations, expiryDate, waGroupLink, status } = req.body;
    const linkId = parseInt(id);

    // Build update data (only include provided fields)
    const updateData = {};

    if (maxRegistrations !== undefined) {
      if (maxRegistrations <= 0) {
        return res.status(400).json({
          success: false,
          message: 'maxRegistrations must be greater than 0'
        });
      }
      updateData.maxRegistrations = parseInt(maxRegistrations);
    }

    if (expiryDate !== undefined) {
      const expiry = new Date(expiryDate);
      if (expiry <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'expiryDate must be in the future'
        });
      }
      updateData.expiryDate = expiry;
    }

    if (waGroupLink !== undefined) {
      updateData.waGroupLink = waGroupLink || null;
    }

    if (status !== undefined) {
      if (!['active', 'expired', 'filled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: active, expired, or filled'
        });
      }
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Update link
    const link = await prisma.registrationLink.update({
      where: {
        id: isNaN(linkId) ? undefined : linkId
      },
      data: updateData,
      include: {
        trainingProgram: true,
        trainingClass: true,
        personnelType: true,
        createdByAdmin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Link updated successfully',
      data: formatLinkResponse(link)
    });
  } catch (error) {
    console.error('Update link error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update link',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/admin/links/:id
 * Delete registration link
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const linkId = parseInt(id);

    // First check if link exists
    const existingLink = await prisma.registrationLink.findUnique({
      where: {
        id: isNaN(linkId) ? undefined : linkId
      }
    });

    if (!existingLink) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    // Check if there are registrations
    if (existingLink.currentRegistrations > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete link with ${existingLink.currentRegistrations} existing registrations. Please contact administrator.`,
        currentRegistrations: existingLink.currentRegistrations
      });
    }

    // Delete link (will cascade delete required documents)
    const link = await prisma.registrationLink.delete({
      where: {
        id: isNaN(linkId) ? undefined : linkId
      }
    });

    res.json({
      success: true,
      message: 'Link deleted successfully',
      data: {
        id: link.id,
        uniqueToken: link.uniqueToken
      }
    });
  } catch (error) {
    console.error('Delete link error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete link',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/admin/links/public/validate/:token
 * Validate token without auth (public endpoint)
 */
router.get('/public/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const link = await prisma.registrationLink.findUnique({
      where: { uniqueToken: token },
      include: {
        trainingProgram: {
          select: {
            id: true,
            name: true,
            durationDays: true
          }
        },
        trainingClass: {
          select: {
            id: true,
            name: true
          }
        },
        personnelType: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Invalid registration link'
      });
    }

    // Check if link is active
    if (link.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Link is ${link.status}. Cannot register.`
      });
    }

    // Check if link has expired
    if (new Date() > new Date(link.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Registration link has expired'
      });
    }

    // Check if link is full
    if (link.currentRegistrations >= link.maxRegistrations) {
      return res.status(400).json({
        success: false,
        message: 'This registration link has reached maximum capacity'
      });
    }

    res.json({
      success: true,
      message: 'Link is valid',
      data: {
        token: link.uniqueToken,
        trainingProgram: link.trainingProgram,
        trainingClass: link.trainingClass,
        personnelType: link.personnelType,
        spotsAvailable: link.maxRegistrations - link.currentRegistrations,
        maxRegistrations: link.maxRegistrations
      }
    });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate link'
    });
  }
});

module.exports = router;
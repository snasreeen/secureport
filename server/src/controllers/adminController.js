import { prisma } from '../lib/prisma.js';

export const getFlaggedScans = async (req, res, next) => {
  try {
    const scans = await prisma.scan.findMany({
      where: { suspicious: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return res.json({ scans });
  } catch (err) {
    return next(err);
  }
};

export const getRecentScans = async (req, res, next) => {
  try {
    const scans = await prisma.scan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    return res.json({ scans });
  } catch (err) {
    return next(err);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return res.json({ logs });
  } catch (err) {
    return next(err);
  }
};


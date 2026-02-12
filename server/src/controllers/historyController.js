import { prisma } from '../lib/prisma.js';

export const getMyHistory = async (req, res, next) => {
  try {
    const logs = await prisma.scan.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ scans: logs });
  } catch (err) {
    return next(err);
  }
};

export const deleteMyScan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scanId = Number(id);

    const existing = await prisma.scan.findFirst({
      where: { id: scanId, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Scan record not found.' });
    }

    await prisma.scanHistory.deleteMany({
      where: { scanId, userId: req.user.id },
    });

    await prisma.scan.delete({
      where: { id: scanId },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'scan_deleted',
        metadata: {
          scanId,
          targetIp: existing.targetIp,
          startPort: existing.startPort,
          endPort: existing.endPort,
        },
        ipAddress: req.ip,
      },
    });

    return res.json({ message: 'Scan history entry deleted.' });
  } catch (err) {
    return next(err);
  }
};

export const exportMyHistory = async (req, res, next) => {
  try {
    const logs = await prisma.scan.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const exportData = logs.map((log) => ({
      targetIp: log.targetIp,
      startPort: log.startPort,
      endPort: log.endPort,
      openPorts: log.openPorts,
      createdAt: log.createdAt,
      ethicalAgreementAcceptedAt: log.ethicalAgreementAcceptedAt,
      suspicious: log.suspicious,
      suspiciousReasons: log.suspiciousReasons,
    }));

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'history_exported',
        metadata: { count: exportData.length },
        ipAddress: req.ip,
      },
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="secureport-history.json"');
    return res.send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    return next(err);
  }
};


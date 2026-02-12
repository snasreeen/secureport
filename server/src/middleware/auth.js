import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const JWT_COOKIE_NAME = 'secureport_token';

export const generateToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign(payload, secret, {
    expiresIn: '1h',
  });
};

export const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie(JWT_COOKIE_NAME);
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies[JWT_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        role: true,
        failedLoginAttempts: true,
        lockUntil: true,
      },
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  return next();
};


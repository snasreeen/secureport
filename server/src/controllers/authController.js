import bcrypt from 'bcrypt';
import validator from 'validator';
import { prisma } from '../lib/prisma.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

const isLocked = (user) =>
  user.lockUntil && new Date(user.lockUntil).getTime() > Date.now();

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (!validator.isStrongPassword(password, { minLength: 8 })) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include a mix of letters, numbers, and symbols.',
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user_registered',
        metadata: { email: user.email },
        ipAddress: req.ip,
      },
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (isLocked(user)) {
      return res
        .status(423)
        .json({ message: 'Account temporarily locked due to failed login attempts.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const failedLoginAttempts = user.failedLoginAttempts + 1;
      const lockUntil =
        failedLoginAttempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
          : user.lockUntil;

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts,
          lockUntil,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: updated.id,
          action: 'login_failed',
          metadata: {
            email: updated.email,
            failedLoginAttempts: updated.failedLoginAttempts,
            lockedUntil: updated.lockUntil,
          },
          ipAddress: req.ip,
        },
      });

      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const resetUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockUntil: null,
      },
    });

    const token = generateToken(resetUser);
    setAuthCookie(res, token);

    await prisma.auditLog.create({
      data: {
        userId: resetUser.id,
        action: 'login_success',
        metadata: { email: resetUser.email },
        ipAddress: req.ip,
      },
    });

    return res.json({
      user: { id: resetUser.id, email: resetUser.email, role: resetUser.role },
    });
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    clearAuthCookie(res);

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'logout',
          metadata: {},
          ipAddress: req.ip,
        },
      });
    }

    return res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    return next(err);
  }
};

export const me = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  return res.json({ user: { id: req.user.id, email: req.user.email, role: req.user.role } });
};


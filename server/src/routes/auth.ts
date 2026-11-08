import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { requireAdminAuth, AuthRequest } from '../middleware/auth.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dental_clinic_jwt_key_2026_9876543210';
const AUTHORIZED_ADMIN = (process.env.ADMIN_EMAIL || 'ephraimcreations254@gmail.com').toLowerCase().trim();

/**
 * POST /api/auth/login
 * Strict Email & Password Authentication for Clinic Administrator
 * Initial password: "12345678"
 * Strictly rejects any other email with HTTP 403 Forbidden.
 */
router.post('/login', (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      error: 'Missing Credentials',
      message: 'Please provide both email address and administrator password.',
    });
    return Promise.resolve();
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // Strict physical rejection for unauthorized emails
  if (normalizedEmail !== AUTHORIZED_ADMIN) {
    console.warn(`[SECURITY ALERT] Unauthorized admin login attempt from: ${normalizedEmail}`);
    res.status(403).json({
      error: 'Access Denied',
      message: 'You are not authorized to log in as administrator. Access is strictly restricted.',
    });
    return Promise.resolve();
  }

  // Find user in database
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as {
    id: number;
    email: string;
    role: string;
    password_hash?: string;
  } | undefined;

  if (!user) {
    res.status(403).json({
      error: 'Access Denied',
      message: 'Administrative record not found.',
    });
    return Promise.resolve();
  }

  // Check if password matches
  const storedHash = user.password_hash || hashPassword('12345678');
  const isPasswordValid = verifyPassword(String(password), storedHash);

  if (!isPasswordValid) {
    res.status(401).json({
      error: 'Invalid Credentials',
      message: 'Incorrect administrator password. Please try again.',
    });
    return Promise.resolve();
  }

  // Sign JWT token with 7-day validity
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set HTTP-only secure cookie
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.json({
    success: true,
    message: 'Authentication successful. Welcome to BrightSmile Clinic Admin.',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });

  return Promise.resolve();
});

/**
 * PUT /api/auth/change-password
 * Protected route allowing the logged-in administrator to change their password
 */
router.put('/change-password', requireAdminAuth, (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({
      error: 'Missing Fields',
      message: 'Both current password and new password are required.',
    });
    return Promise.resolve();
  }

  if (String(newPassword).length < 6) {
    res.status(400).json({
      error: 'Weak Password',
      message: 'New password must be at least 6 characters long.',
    });
    return Promise.resolve();
  }

  const userId = req.user?.id;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return Promise.resolve();
  }

  const storedHash = user.password_hash || hashPassword('12345678');
  const isCurrentValid = verifyPassword(String(currentPassword), storedHash);

  if (!isCurrentValid) {
    res.status(400).json({
      error: 'Invalid Password',
      message: 'Current password does not match our records.',
    });
    return Promise.resolve();
  }

  // Hash and save new password
  const newHash = hashPassword(String(newPassword));
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);

  console.log(`[Security] Admin password successfully updated for user #${userId}`);

  res.json({
    success: true,
    message: 'Password updated successfully! You can now use your new password to sign in.',
  });

  return Promise.resolve();
});

/**
 * POST /api/auth/request-verification (OTP Fallback)
 * Strict email check: only ephraimcreations254@gmail.com is permitted.
 */
router.post('/request-verification', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Strict physical rejection for unauthorized emails
  if (normalizedEmail !== AUTHORIZED_ADMIN) {
    console.warn(`[SECURITY ALERT] Unauthorized admin access attempt from: ${normalizedEmail}`);
    res.status(403).json({
      error: 'Access Denied',
      message: 'You are not authorized to log in as administrator. Access is strictly restricted.',
    });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  let user = db.prepare('SELECT id, email, role FROM users WHERE email = ?').get(normalizedEmail) as { id: number; email: string; role: string } | undefined;

  if (!user) {
    const insertResult = db.prepare('INSERT INTO users (email, role, otp_code, otp_expires_at) VALUES (?, ?, ?, ?)').run(
      normalizedEmail,
      'admin',
      otp,
      expiresAt
    );
    user = { id: Number(insertResult.lastInsertRowid), email: normalizedEmail, role: 'admin' };
  } else {
    db.prepare('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?').run(otp, expiresAt, user.id);
  }

  const mailResult = await sendOtpEmail(normalizedEmail, otp);
  const isDev = process.env.NODE_ENV !== 'production';

  res.json({
    success: true,
    message: `Verification code successfully sent. Code expires in 10 minutes.`,
    email: normalizedEmail,
    ...(isDev ? { debugOtp: otp, previewUrl: mailResult.previewUrl } : {}),
  });
});

/**
 * POST /api/auth/verify (OTP Verification)
 */
router.post('/verify', (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ error: 'Email and OTP code are required' });
    return Promise.resolve();
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  if (normalizedEmail !== AUTHORIZED_ADMIN) {
    res.status(403).json({
      error: 'Access Denied',
      message: 'Unauthorized email address.',
    });
    return Promise.resolve();
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as any;

  if (!user || !user.otp_code || !user.otp_expires_at) {
    res.status(400).json({
      error: 'Invalid Request',
      message: 'No pending verification code found. Please request a new code.',
    });
    return Promise.resolve();
  }

  if (Date.now() > user.otp_expires_at) {
    db.prepare('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?').run(user.id);
    res.status(400).json({
      error: 'Code Expired',
      message: 'The verification code has expired. Please request a fresh one.',
    });
    return Promise.resolve();
  }

  const cleanInputOtp = String(otp).trim();
  if (user.otp_code !== cleanInputOtp) {
    res.status(400).json({
      error: 'Invalid Code',
      message: 'Incorrect 6-digit verification code. Please check and try again.',
    });
    return Promise.resolve();
  }

  db.prepare('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?').run(user.id);

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.json({
    success: true,
    message: 'Authentication successful. Welcome to BrightSmile Clinic Admin.',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });

  return Promise.resolve();
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAdminAuth, (req: AuthRequest, res: Response) => {
  res.json({
    authenticated: true,
    user: req.user,
  });
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dental_clinic_jwt_key_2026_9876543210';
const AUTHORIZED_ADMIN = (process.env.ADMIN_EMAIL || 'ephraimcreations254@gmail.com').toLowerCase().trim();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export function requireAdminAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  // Check cookie first, then Authorization header
  let token: string | undefined = req.cookies?.admin_token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication session required. Please verify via OTP.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
    };

    // Strict validation: enforce authorized admin email
    if (decoded.email.toLowerCase().trim() !== AUTHORIZED_ADMIN) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Physical security check failed: Token email is not authorized for administrative access.',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired administrative session token. Please log in again.',
    });
  }
}

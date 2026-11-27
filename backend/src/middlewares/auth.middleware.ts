import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '../models/user.model.js';

export interface AuthPayload {
  id: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Không có token, từ chối truy cập' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!token) {
      res.status(401).json({ message: 'Không có token, từ chối truy cập' });
      return;
    }

    if (!secret) {
      res.status(500).json({ message: 'Thiếu cấu hình JWT_SECRET' });
      return;
    }

    const decoded = jwt.verify(token, secret) as unknown as AuthPayload;
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
      return;
    }
    next();
  };
};
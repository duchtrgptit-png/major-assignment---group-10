import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

const signToken = (id: string, role: 'user' | 'admin'): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign({ id, role }, secret, { expiresIn: '7d' });
};

// POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existed = await User.findOne({ email: normalizedEmail });
    if (existed) {
      res.status(409).json({ message: 'Email đã tồn tại' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role: 'user',
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      return;
    }

    const token = signToken(user._id.toString(), user.role);

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/me
export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      {
        ...(fullName !== undefined && { fullName }),
        ...(phone !== undefined && { phone }),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
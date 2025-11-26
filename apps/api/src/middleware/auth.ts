import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { AppError } from '../utils/AppError'
import User from '../models/User'
import Role from '../models/Role'

// JWT payload type
export interface AuthRequest extends Request {
  user?: {
    id: string
  }
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Không có token hoặc token không hợp lệ', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyToken(token)

    // decoded chứa: { id: "...", role: ... }
    req.user = { id: decoded.id }
    next()
  } catch (err) {
    throw new AppError('Token không hợp lệ hoặc đã hết hạn', 401)
  }
}

// ==========================
// ADMIN ONLY (RBAC)
// ==========================
export const adminOnly = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.id) {
    throw new AppError('Không có thông tin người dùng', 401)
  }

  // Load user + role
  const user = await User.findById(req.user.id).populate('role')

  if (!user) {
    throw new AppError('Không tìm thấy user', 401)
  }

  // Nếu user không có role → chặn
  if (!user.role) {
    throw new AppError('Không có quyền truy cập', 403)
  }

  const role = user.role as any

  // ⭐ SUPER ADMIN có full quyền → qua luôn
  if (role.isSystem === true) {
    return next()
  }

  // ⭐ Cho phép roles có quyền quản lý hệ thống
  if (role.permissions?.includes('settings.manage')) {
    return next()
  }

  // ❌ Mặc định chặn
  throw new AppError('Không có quyền truy cập', 403)
}

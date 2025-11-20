import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { AppError } from '../utils/AppError'

export interface AuthRequest extends Request {
  user?: { id: string; role: string }
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
    req.user = decoded
    next()
  } catch (err) {
    throw new AppError('Token không hợp lệ hoặc đã hết hạn', 401)
  }
}

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    throw new AppError('Không có quyền truy cập', 403)
  }
  next()
}

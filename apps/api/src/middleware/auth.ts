import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { AppError } from '../utils/AppError'

export interface AuthRequest extends Request {
  user?: {
    id: string
    permissions: string[] // ⭐ thêm vào đây
  }
}

export const protect = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Không có token hoặc token không hợp lệ', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded: any = verifyToken(token)

    // ⭐ FIX QUAN TRỌNG
    req.user = {
      id: decoded.id,
      permissions: decoded.permissions || [] // <-- PHẢI CÓ
    }

    next()
  } catch (err) {
    throw new AppError('Token không hợp lệ hoặc đã hết hạn', 401)
  }
}

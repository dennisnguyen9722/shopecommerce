import { Request, Response, NextFunction } from 'express'
import User from '../models/User'
import Role from '../models/Role'

export function requirePermissions(...requiredPermissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?._id

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Load user
      const user = await User.findById(userId).populate('role')
      if (!user) return res.status(401).json({ error: 'User not found' })

      // Nếu user không có role → không có quyền gì
      if (!user.role) {
        return res.status(403).json({ error: 'Không có quyền truy cập' })
      }

      const role = user.role as any
      const userPermissions: string[] = role.permissions || []

      // Nếu role là Super Admin (isSystem = true) → full quyền
      if (role.isSystem) {
        return next()
      }

      // Check từng permission được yêu cầu
      const hasAll = requiredPermissions.every((p) =>
        userPermissions.includes(p)
      )

      if (!hasAll) {
        return res.status(403).json({
          error: 'Bạn không có quyền thực hiện hành động này',
          missing: requiredPermissions
        })
      }

      next()
    } catch (err) {
      console.error('Permission check failed:', err)
      return res.status(500).json({ error: 'Permission check error' })
    }
  }
}

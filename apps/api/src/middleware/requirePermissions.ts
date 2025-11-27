import { Request, Response, NextFunction } from 'express'
import User from '../models/User'
import Role from '../models/Role'

export function requirePermissions(...requiredPermissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id
      if (!userId) return res.status(401).json({ error: 'Unauthorized' })

      const user = await User.findById(userId).populate('role')
      if (!user) return res.status(401).json({ error: 'User not found' })

      if (!user.role) {
        return res.status(403).json({ error: 'Không có quyền truy cập' })
      }

      const role = user.role as any

      // ⭐ Normalize FE permissions → BE permissions
      const fix = (p: string) => p.replace(/_/g, '.').toLowerCase()

      const userPermissions: string[] = (role.permissions || []).map(fix)
      const required = requiredPermissions.map(fix)

      // ⭐ SUPER ADMIN
      if (role.isSystem) return next()

      // ⭐ ANY required permission is enough
      const allowed = required.some((p) => userPermissions.includes(p))

      if (!allowed) {
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

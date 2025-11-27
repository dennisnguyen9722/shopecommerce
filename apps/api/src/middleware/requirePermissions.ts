import { Request, Response, NextFunction } from 'express'
import User from '../models/User'

/**
 * Middleware kiểm tra permissions linh hoạt
 * - Hỗ trợ cả permissions dạng "manage_*" và dạng chi tiết "resource.*"
 * - Tự động mapping giữa 2 dạng
 */
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
      const userPermissions: string[] = role.permissions || []

      // ⭐ SUPER ADMIN - bypass all checks
      if (role.isSystem) {
        console.log('✅ Super Admin - bypass')
        return next()
      }

      // ⭐ PERMISSION MAPPING TABLE
      const permissionMap: Record<string, string> = {
        manage_products: 'products',
        manage_categories: 'categories',
        manage_orders: 'orders',
        manage_customers: 'customers',
        manage_users: 'users',
        manage_inventory: 'inventory',
        manage_blog: 'blog',
        manage_banners: 'banners',
        manage_roles: 'roles',
        manage_settings: 'settings'
      }

      // ⭐ LOGIC KIỂM TRA PERMISSIONS
      const hasPermission = requiredPermissions.some((required) => {
        // 1. Kiểm tra trực tiếp
        if (userPermissions.includes(required)) {
          console.log(`✅ Direct match: ${required}`)
          return true
        }

        // 2. Nếu là permission dạng "manage_*"
        // → Kiểm tra xem user có permission chi tiết "resource.*" không
        const resourcePrefix = permissionMap[required]
        if (resourcePrefix) {
          const hasDetailedPerms = userPermissions.some((p) =>
            p.startsWith(`${resourcePrefix}.`)
          )
          if (hasDetailedPerms) {
            const matchedPerms = userPermissions
              .filter((p) => p.startsWith(`${resourcePrefix}.`))
              .join(', ')
            console.log(`✅ Mapped: ${required} → ${matchedPerms}`)
            return true
          }
        }

        // 3. Nếu là permission dạng "resource.action"
        // → Kiểm tra xem user có "manage_resource" không
        const parts = required.split('.')
        if (parts.length === 2) {
          const [resource] = parts
          const manageKey = `manage_${resource}`
          if (userPermissions.includes(manageKey)) {
            console.log(`✅ Reverse mapped: ${required} → ${manageKey}`)
            return true
          }
        }

        return false
      })

      if (!hasPermission) {
        console.log('❌ Missing permission:', {
          required: requiredPermissions,
          has: userPermissions
        })
        return res.status(403).json({
          error: 'Bạn không có quyền thực hiện hành động này',
          missing: requiredPermissions
        })
      }

      console.log('✅ Permission check passed')
      next()
    } catch (err) {
      console.error('❌ Permission check failed:', err)
      return res.status(500).json({ error: 'Permission check error' })
    }
  }
}

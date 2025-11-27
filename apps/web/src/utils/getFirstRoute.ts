import { PERMISSION_ROUTES } from '../constants/role-routes'

export function getFirstRoute(user: any) {
  if (!user) return '/admin/login'

  // SUPER ADMIN
  if (user.role?.isSystem) return '/admin/overview'

  const perms: string[] = user.permissions || []

  for (const item of PERMISSION_ROUTES) {
    if (item.perms.some((p) => perms.includes(p))) {
      return item.route
    }
  }

  return '/admin/overview' // fallback
}

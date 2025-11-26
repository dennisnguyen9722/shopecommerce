import { PERMISSION_ROUTES } from '@/src/constants/role-routes'

export function getFirstAccessibleRoute(permissions: string[]): string {
  for (const p of permissions) {
    if (PERMISSION_ROUTES[p]) {
      return PERMISSION_ROUTES[p]
    }
  }

  // fallback khi không có gì → cho vào trang login
  return '/admin/login'
}

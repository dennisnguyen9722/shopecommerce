// src/hooks/usePermission.ts
import { useAuthStore } from '@/src/store/authStore'

export function usePermission(key: string) {
  const user = useAuthStore((s) => s.user)

  if (!user) return false

  // SUPER ADMIN → full quyền
  if (user.role?.isSystem) return true

  return user.permissions?.includes(key)
}

export function usePermissions(keys: string[]) {
  const user = useAuthStore((s) => s.user)

  if (!user) return false

  // SUPER ADMIN → full quyền
  if (user.role?.isSystem) return true

  return keys.some((k) => user.permissions?.includes(k))
}

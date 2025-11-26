import { useAuthStore } from '@/src/store/authStore'

export function usePermission(key: string) {
  const user = useAuthStore((s) => s.user)
  return user?.permissions?.includes(key)
}

export function usePermissions(keys: string[]) {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  return keys.some((k) => user.permissions?.includes(k))
}

// src/hooks/usePermission.ts
import { useAuthStore } from '@/src/store/authStore'

export function usePermission(key: string) {
  const user = useAuthStore((s) => s.user)

  if (!user) return false

  // Ép kiểu role sang any hoặc check object để tránh lỗi TS
  const role = user.role as any

  // SUPER ADMIN → full quyền
  if (role?.isSystem) return true

  // Check trong mảng permissions của user (hoặc của role nếu logic của bạn nằm ở role)
  return user.permissions?.includes(key) || false
}

export function usePermissions(keys: string[]) {
  const user = useAuthStore((s) => s.user)

  if (!user) return false

  const role = user.role as any

  // SUPER ADMIN → full quyền
  if (role?.isSystem) return true

  return keys.some((k) => user.permissions?.includes(k)) || false
}

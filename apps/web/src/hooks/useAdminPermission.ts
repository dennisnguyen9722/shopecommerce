// src/hooks/useAdminPermission.ts
import { useAdminAuthStore } from '@/src/store/adminAuthStore'

export function useAdminPermission(key: string) {
  // 👇 Lấy thông tin từ kho Admin
  const admin = useAdminAuthStore((s) => s.admin)

  if (!admin) return false

  // Ép kiểu role để tránh lỗi TypeScript
  const role = admin.role as any

  // Nếu là Super Admin (isSystem) -> Full quyền
  if (role?.isSystem) return true

  // Kiểm tra danh sách quyền
  return admin.permissions?.includes(key) || false
}

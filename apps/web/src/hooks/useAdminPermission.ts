import { useAdminAuthStore } from '@/src/store/adminAuthStore'

export function useAdminPermission(requiredPermission: string) {
  const { admin } = useAdminAuthStore()

  // 1. Chưa đăng nhập -> Không có quyền
  if (!admin) return false

  // 2. Nếu là Super Admin (role === 'admin') hoặc System Admin
  // -> Luôn trả về TRUE (Bỏ qua check mảng permissions)
  if (admin.role === 'admin' || admin.isSystem) return true

  // 3. User thường -> Kiểm tra xem trong mảng permissions có quyền này không
  // Lưu ý: permissions lúc này lưu các chuỗi như 'products.read', 'orders.read'...
  return admin.permissions?.includes(requiredPermission) || false
}

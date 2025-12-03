import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from './authStore' // Tái sử dụng type User từ file cũ

// Định nghĩa State riêng cho Admin
interface AdminAuthState {
  token: string | null
  admin: User | null // Đổi tên biến user -> admin cho đỡ nhầm
  isAuthenticated: boolean
  _hasHydrated: boolean

  setAdminAuth: (token: string, admin: User) => void
  logoutAdmin: () => void
  setHasHydrated: (state: boolean) => void
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      _hasHydrated: false,

      // Hàm đăng nhập cho Admin
      setAdminAuth: (token, admin) =>
        set({
          token,
          admin,
          isAuthenticated: true
        }),

      // Hàm đăng xuất cho Admin
      logoutAdmin: () =>
        set({
          token: null,
          admin: null,
          isAuthenticated: false
        }),

      setHasHydrated: (state) => set({ _hasHydrated: state })
    }),
    {
      name: 'admin-auth-storage', // 👈 QUAN TRỌNG: Key này KHÁC với 'auth-storage' của khách hàng
      onRehydrateStorage: () => (state, error) => {
        if (!error) state?.setHasHydrated(true)
      }
    }
  )
)

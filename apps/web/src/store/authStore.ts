import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Định nghĩa lại Role cho chuẩn
interface Role {
  _id: string
  name: string
  isSystem?: boolean
  permissions?: string[]
}

export interface User {
  _id: string
  name: string
  email: string
  // ⭐ FIX: role có thể là string (ID) hoặc Object (khi đã populate)
  role?: string | Role
  permissions?: string[] // Permissions riêng của user (nếu có)

  loyaltyPoints: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  totalSpent: number
  avatar?: string
  [key: string]: any
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  _hasHydrated: boolean

  setAuth: (token: string, user: User) => void
  updateUser: (data: Partial<User>) => void
  logout: () => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null
        })),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      setHasHydrated: (state) => set({ _hasHydrated: state })
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state, error) => {
        if (!error) state?.setHasHydrated(true)
      }
    }
  )
)

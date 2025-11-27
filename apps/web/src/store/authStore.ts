import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: any | null
  isAuthenticated: boolean
  _hasHydrated: boolean

  setAuth: (token: string, user: any) => void
  updateUser: (data: any) => void
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

      // Login và lưu user
      setAuth: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true
        }),

      // ⭐ Update user (avatar, name, email...) => Header tự update
      updateUser: (data) =>
        set((state) => ({
          user: { ...state.user, ...data }
        })),

      // Logout
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false
        }),

      // Hydration flag
      setHasHydrated: (state) => set({ _hasHydrated: state })
    }),

    {
      name: 'auth-storage',

      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('❌ Error during hydration', error)
        } else {
          state?.setHasHydrated(true)
        }
      }
    }
  )
)

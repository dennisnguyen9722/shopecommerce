import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: any | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  setAuth: (token: string, user: any) => void
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

      setAuth: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false
        }),

      setHasHydrated: (state) => set({ _hasHydrated: state })
    }),

    {
      name: 'auth-storage',

      // Khi persist load xong → mark hydrated
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

/* eslint-disable react-hooks/set-state-in-effect */
// src/hooks/useAuth.ts
'use client'

import { useEffect, useState } from 'react'
import { getCookie } from 'cookies-next'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in by checking token and user data in cookies
    const token = getCookie('customer_token')
    const userData = getCookie('customer_user')

    if (token && userData) {
      try {
        const parsedUser =
          typeof userData === 'string' ? JSON.parse(userData) : userData
        setUser({
          id: parsedUser.id || parsedUser._id,
          name: parsedUser.name,
          email: parsedUser.email,
          phone: parsedUser.phone,
          avatar: parsedUser.avatar
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
        setUser(null)
      }
    } else {
      setUser(null)
    }

    setIsLoading(false)
  }, [])

  const logout = () => {
    // Clear cookies and redirect to login
    document.cookie =
      'customer_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie =
      'customer_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setUser(null)
    window.location.href = '/login'
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout
  }
}

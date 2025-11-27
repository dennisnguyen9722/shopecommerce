'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import api from '@/src/lib/api'
import { setCookie } from 'cookies-next'
import { getFirstRoute } from '@/src/utils/getFirstRoute'
import { toast } from 'sonner' // ⭐ THÊM IMPORT

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleLogin() {
    try {
      setErr('')
      setLoading(true)

      const { data } = await api.post('/auth/login', { email, password })

      // Lưu token zustand
      setAuth(data.token, data.user)

      // Lưu cookie cho middleware
      setCookie('token', data.token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })

      // ⭐ THÊM TOAST
      toast.success('Đăng nhập thành công! 🎉')

      // CHỜ ZUSTAND CẬP NHẬT
      setTimeout(() => {
        const firstRoute = getFirstRoute(data.user)
        console.log('➡ redirect to:', firstRoute)
        router.push(firstRoute)
      }, 50)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại'
      setErr(errorMsg)
      toast.error(errorMsg) // ⭐ THÊM TOAST ERROR
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-[360px]">
        <CardHeader>
          <CardTitle>Đăng nhập Admin</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Nhập email"
            value={email}
            autoComplete="off"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()} // ⭐ BONUS: Enter để login
          />

          <Input
            type="password"
            placeholder="Nhập mật khẩu"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()} // ⭐ BONUS
          />

          {err && <p className="text-red-500 text-sm text-center">{err}</p>}

          <Button className="w-full" onClick={handleLogin} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

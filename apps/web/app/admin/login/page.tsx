'use client'
console.log('🔥 LOGIN PAGE RENDERED!!!')

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/src/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import api from '@/src/lib/api'
import { setCookie } from 'cookies-next'

// ⭐ ADD THIS
import { getFirstAccessibleRoute } from '@/src/utils/getFirstRoute'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)

  const from = params.get('from')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleLogin() {
    try {
      setLoading(true)
      setErr('')

      const { data } = await api.post('/auth/login', {
        email,
        password
      })

      // Lưu token + user vào zustand
      setAuth(data.token, data.user)

      // Lưu token vào cookie để middleware dùng
      setCookie('token', data.token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })

      // ⭐ LẤY DANH SÁCH QUYỀN → TÌM TRANG ĐẦU TIÊN USER ĐƯỢC VÀO
      const perms = data.user.permissions || []
      const firstRoute = getFirstAccessibleRoute(perms)

      // ⭐ điều hướng về route phù hợp
      router.push(firstRoute)
    } catch (error: any) {
      setErr(error.response?.data?.message || 'Đăng nhập thất bại')
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
          {from === 'admin' && (
            <p className="text-yellow-600 bg-yellow-100 border border-yellow-300 p-2 rounded text-sm text-center">
              Bạn cần đăng nhập để tiếp tục.
            </p>
          )}

          <Input
            placeholder="Nhập email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Nhập mật khẩu"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

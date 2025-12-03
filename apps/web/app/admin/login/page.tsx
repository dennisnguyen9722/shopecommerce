'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// 👇 THAY ĐỔI 1: Import store riêng của Admin
import { useAdminAuthStore } from '@/src/store/adminAuthStore'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import api from '@/src/lib/api'
import { setCookie } from 'cookies-next'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  // 👇 THAY ĐỔI 2: Lấy hàm setAdminAuth từ store mới
  const setAdminAuth = useAdminAuthStore((s) => s.setAdminAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleLogin() {
    if (!email || !password) {
      setErr('Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      setErr('')
      setLoading(true)

      const { data } = await api.post('/auth/login', { email, password })
      const user = data.user

      // 👇 THAY ĐỔI 3: Kiểm tra quyền Admin/System
      // Nếu là user thường thì không cho vào trang Admin
      if (
        user.role === 'user' ||
        (!user.role?.isSystem && user.role !== 'admin')
      ) {
        throw new Error('Tài khoản không có quyền truy cập Admin')
      }

      // 👇 THAY ĐỔI 4: Lưu vào Store Admin
      setAdminAuth(data.token, user)

      // Lưu cookie (Giữ nguyên để Middleware hoạt động)
      setCookie('token', data.token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })

      toast.success('Xin chào Administrator! 🎉')

      // Chuyển hướng thẳng vào Dashboard
      setTimeout(() => {
        router.push('/admin/overview')
      }, 100)
    } catch (err: any) {
      console.error(err)
      const errorMsg =
        err.message || err.response?.data?.error || 'Đăng nhập thất bại'
      setErr(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <Card className="w-full max-w-[400px] shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2 text-xl">
            🔐
          </div>
          <CardTitle className="text-2xl">Đăng nhập Admin</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Input
              placeholder="Email quản trị"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Mật khẩu"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="h-11"
            />
          </div>

          {err && (
            <div className="p-3 rounded bg-red-50 text-red-600 text-sm text-center border border-red-100">
              {err}
            </div>
          )}

          <Button
            className="w-full h-11 text-base font-medium"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
              </>
            ) : (
              'Truy cập Dashboard'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

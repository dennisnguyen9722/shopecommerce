'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
// 👇 Import store riêng của Admin
import { useAdminAuthStore } from '@/src/store/adminAuthStore'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import api from '@/src/lib/api'
import { setCookie } from 'cookies-next'
import { toast } from 'sonner'
import { Loader2, ShieldAlert } from 'lucide-react'

// =================================================================
// 1. TÁCH RA THÀNH LOGIN FORM ĐỂ DÙNG HOOK useSearchParams
// =================================================================
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams() // 👈 Hook lấy tham số URL

  // Lấy hàm setAdminAuth từ store
  const setAdminAuth = useAdminAuthStore((s) => s.setAdminAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  // 👇 LOGIC MỚI: Kiểm tra xem có phải vừa bị đá ra không
  useEffect(() => {
    const sessionExpired = searchParams.get('sessionExpired')

    if (sessionExpired === 'true') {
      // Hiện thông báo lỗi
      toast.error('Phiên đăng nhập hết hạn', {
        description: 'Vui lòng đăng nhập lại để tiếp tục.',
        icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
        duration: 5000
      })

      // Xóa cờ trên URL nhìn cho sạch (giữ lại redirect url nếu có)
      const redirect = searchParams.get('redirect')
      const newUrl = redirect
        ? `/admin/login?redirect=${encodeURIComponent(redirect)}`
        : '/admin/login'

      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams])

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

      // Kiểm tra quyền Admin/System
      if (
        user.role === 'user' ||
        (!user.role?.isSystem && user.role !== 'admin')
      ) {
        throw new Error('Tài khoản không có quyền truy cập Admin')
      }

      // Lưu vào Store Admin
      setAdminAuth(data.token, user)

      // Lưu cookie
      setCookie('token', data.token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })

      toast.success('Đăng nhập thành công! 🎉')

      // 👇 LOGIC MỚI: Redirect thông minh
      // Nếu có link cũ cần quay lại thì ưu tiên, không thì về Overview
      const redirectUrl = searchParams.get('redirect')

      setTimeout(() => {
        if (redirectUrl) {
          router.push(decodeURIComponent(redirectUrl))
        } else {
          router.push('/admin/overview')
        }
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
  )
}

// =================================================================
// 2. COMPONENT CHÍNH (BỌC SUSPENSE)
// =================================================================
export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
      {/* ⚠️ QUAN TRỌNG: Bọc Suspense để tránh lỗi useSearchParams của Next.js */}
      <Suspense fallback={<div>Đang tải form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

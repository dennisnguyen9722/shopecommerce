'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/store/authStore'
import api from '@/src/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'
import { setCookie } from 'cookies-next'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData)

    try {
      // 👇 QUAN TRỌNG: Gọi API Login dành riêng cho Khách hàng
      const res = await api.post('/public/auth/login', data)

      // 1. Lưu vào Store (Zustand)
      setAuth(res.data.token, res.data.user)

      // 2. Lưu Cookie (để Middleware hoạt động nếu cần)
      setCookie('token', res.data.token, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })

      toast.success('Đăng nhập thành công! 🎉')

      // 3. Chuyển hướng về trang chủ
      router.push('/')
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Email hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-orange-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-orange-600">
            Đăng nhập
          </CardTitle>
          <CardDescription>Chào mừng bạn quay trở lại!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  href="#"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 font-bold"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              className="text-orange-600 font-bold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

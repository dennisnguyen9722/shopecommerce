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

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData)

    try {
      // 👇 QUAN TRỌNG: Gọi API Register dành riêng cho Khách hàng
      const res = await api.post('/public/auth/register', data)

      // 1. Tự động đăng nhập luôn sau khi đăng ký
      setAuth(res.data.token, res.data.user)
      setCookie('token', res.data.token, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })

      toast.success('Đăng ký tài khoản thành công! 🎁')

      // 2. Chuyển hướng
      router.push('/')
    } catch (err: any) {
      console.error(err)
      toast.error(
        err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-orange-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-orange-600">
            Tạo tài khoản mới
          </CardTitle>
          <CardDescription>
            Tích điểm và nhận ưu đãi ngay hôm nay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input name="name" required placeholder="Nguyễn Văn A" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                required
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <Input
                name="password"
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự"
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 font-bold"
              disabled={loading}
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Đã có tài khoản?{' '}
            <Link
              href="/login"
              className="text-orange-600 font-bold hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

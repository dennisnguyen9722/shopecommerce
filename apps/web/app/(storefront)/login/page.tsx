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
import { Mail, Lock } from 'lucide-react'

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
      const res = await api.post('/public/auth/login', data)

      setAuth(res.data.token, res.data.user)

      setCookie('token', res.data.token, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })

      toast.success('Đăng nhập thành công! 🎉')
      router.push('/')
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Email hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] !bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border border-gray-200 !bg-white">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl">🎁</span>
          </div>
          <CardTitle className="text-3xl font-bold !text-gray-900">
            Đăng nhập
          </CardTitle>
          <CardDescription className="!text-gray-600">
            Chào mừng bạn quay trở lại DennisShop!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="!text-gray-700 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="pl-10 !bg-white !text-gray-900 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="password"
                  className="!text-gray-700 font-medium"
                >
                  Mật khẩu
                </Label>
                <Link
                  href="/forgot-password" // 👈 Trỏ tới trang chúng ta vừa làm
                  className="text-xs text-orange-600 hover:text-orange-700 hover:underline font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Nhập mật khẩu"
                  className="pl-10 !bg-white !text-gray-900 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-6 text-base shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm !text-gray-600">
              Chưa có tài khoản?{' '}
              <Link
                href="/register"
                className="text-orange-600 font-bold hover:text-orange-700 hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

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
import { User, Mail, Lock, Gift } from 'lucide-react'

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
      const res = await api.post('/public/auth/register', data)

      setAuth(res.data.token, res.data.user)
      setCookie('token', res.data.token, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })

      toast.success('Đăng ký tài khoản thành công! 🎊')
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
    <div className="flex justify-center items-center min-h-[80vh] !bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border border-gray-200 !bg-white">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold !text-gray-900">
            Tạo tài khoản mới
          </CardTitle>
          <CardDescription className="!text-gray-600">
            Tích điểm và nhận ưu đãi ngay hôm nay
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="!text-gray-700 font-medium">
                Họ và tên
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Nguyễn Văn A"
                  className="pl-10 !bg-white !text-gray-900 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

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
              <Label htmlFor="password" className="!text-gray-700 font-medium">
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  minLength={6}
                  className="pl-10 !bg-white !text-gray-900 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <p className="text-xs !text-gray-500 mt-1">
                Mật khẩu phải có ít nhất 6 ký tự
              </p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="terms" className="text-xs !text-gray-600">
                Tôi đồng ý với{' '}
                <Link
                  href="/terms"
                  className="text-orange-600 hover:underline font-medium"
                >
                  Điều khoản dịch vụ
                </Link>{' '}
                và{' '}
                <Link
                  href="/privacy"
                  className="text-orange-600 hover:underline font-medium"
                >
                  Chính sách bảo mật
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-6 text-base shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm !text-gray-600">
              Đã có tài khoản?{' '}
              <Link
                href="/login"
                className="text-orange-600 font-bold hover:text-orange-700 hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="!bg-white px-2 !text-gray-500">
                Hoặc đăng ký với
              </span>
            </div>
          </div>

          {/* Social Register */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors !bg-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium !text-gray-700">Google</span>
            </button>

            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors !bg-white">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-medium !text-gray-700">
                Facebook
              </span>
            </button>
          </div>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-xs font-semibold !text-orange-900 mb-2">
              🎁 Quyền lợi thành viên:
            </p>
            <ul className="text-xs !text-orange-800 space-y-1">
              <li>✓ Tích điểm với mỗi đơn hàng</li>
              <li>✓ Ưu đãi sinh nhật đặc biệt</li>
              <li>✓ Voucher giảm giá độc quyền</li>
              <li>✓ Giao hàng miễn phí cho thành viên VIP</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

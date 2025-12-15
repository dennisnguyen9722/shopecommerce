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

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  // Lấy token từ URL
  const token = params.token as string

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      return toast.error('Mật khẩu phải có ít nhất 6 ký tự')
    }
    if (password !== confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp')
    }

    setLoading(true)
    try {
      // Gọi API Reset Password với token trên URL
      await api.put(`/public/customer-auth/reset-password/${token}`, {
        password
      })

      setSuccess(true)
      toast.success('Đổi mật khẩu thành công!')

      // Tự động chuyển hướng sau 3 giây
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Link này đã hết hạn hoặc không hợp lệ'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
          {!success && (
            <p className="text-sm text-gray-500 mt-2">
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
            </p>
          )}
        </div>

        {success ? (
          // TRẠNG THÁI: THÀNH CÔNG
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-gray-700 font-medium">
              Mật khẩu của bạn đã được thay đổi thành công!
              <br />
              <span className="text-sm text-gray-500 font-normal">
                Đang chuyển hướng đến trang đăng nhập...
              </span>
            </div>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Đăng nhập ngay
            </Button>
          </div>
        ) : (
          // TRẠNG THÁI: FORM NHẬP PASS MỚI
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mật khẩu mới */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 bg-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-2">
              <Label htmlFor="confirm">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold mt-2"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận đổi mật khẩu
            </Button>
          </form>
        )}

        {!success && (
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-orange-600 hover:underline"
            >
              Hủy bỏ
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

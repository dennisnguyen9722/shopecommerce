'use client'

import { useState } from 'react'
import Link from 'next/link'
import api from '@/src/lib/api' // Import axios instance của bạn
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error('Vui lòng nhập email')

    setLoading(true)
    try {
      // Gọi API Backend mà chúng ta vừa tạo
      await api.post('/public/customer-auth/forgot-password', { email })
      setIsSent(true)
      toast.success('Email hướng dẫn đã được gửi!')
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Quên mật khẩu?</h1>
          <p className="text-sm text-gray-500 mt-2">
            Đừng lo lắng! Hãy nhập email đăng ký của bạn, chúng tôi sẽ gửi hướng
            dẫn khôi phục.
          </p>
        </div>

        {isSent ? (
          // TRẠNG THÁI: ĐÃ GỬI THÀNH CÔNG
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-sm">
              Chúng tôi đã gửi email đến <strong>{email}</strong>.
              <br />
              Vui lòng kiểm tra hộp thư (bao gồm cả mục Spam) để đặt lại mật
              khẩu.
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSent(false)}
              >
                Thử lại với email khác
              </Button>
              <Link href="/login" className="block w-full">
                <Button variant="ghost" className="w-full">
                  Quay về đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // TRẠNG THÁI: FORM NHẬP EMAIL
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email của bạn</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nguyenvan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-white"
                  required
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi yêu cầu khôi phục
            </Button>
          </form>
        )}

        {/* Footer */}
        {!isSent && (
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" /> Quay lại trang đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

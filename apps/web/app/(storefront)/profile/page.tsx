/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react' // 👈 Thêm useState
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/store/authStore'
import {
  LogOut,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  Gift,
  Loader2
} from 'lucide-react' // Thêm icon Loader2
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()

  // 1. Thêm state để kiểm tra xem component đã load xong chưa
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // Đánh dấu là đã load xong (Client-side)
  }, [])

  // 2. Logic bảo vệ trang (Chỉ chạy khi đã mounted)
  useEffect(() => {
    if (mounted) {
      // Nếu load xong rồi mà vẫn chưa login -> Mới đá về
      if (!isAuthenticated) {
        router.push('/login')
      }
    }
  }, [isAuthenticated, router, mounted])

  // 3. Trong lúc chờ load (hoặc chưa có user), hiện Loading để tránh màn hình trắng hoặc redirect sai
  if (!mounted || !user) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // --- PHẦN GIAO DIỆN BÊN DƯỚI GIỮ NGUYÊN ---
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Hồ sơ cá nhân</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CỘT TRÁI */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-4">
              <img
                src={user.avatar || 'https://github.com/shadcn.png'}
                alt={user.name}
                className="w-full h-full object-cover rounded-full border-4 border-orange-100"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mt-1">
              {user.role === 'admin'
                ? 'Quản trị viên'
                : 'Khách hàng thân thiết'}
            </p>

            <div className="mt-4 flex flex-col gap-2 w-full">
              <div className="bg-orange-50 text-orange-700 py-2 px-4 rounded-lg text-sm font-bold flex justify-between items-center">
                <span>Điểm thưởng:</span>
                <span>{user.loyaltyPoints?.toLocaleString() ?? 0}</span>
              </div>
              <div className="bg-yellow-50 text-yellow-700 py-2 px-4 rounded-lg text-sm font-bold flex justify-between items-center">
                <span>Hạng:</span>
                <span className="uppercase">
                  {user.loyaltyTier ?? 'Member'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <a
              href="/loyalty"
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-100"
            >
              <Gift className="text-indigo-500" size={20} />
              <span className="font-medium text-gray-700">
                Đổi quà & Ưu đãi
              </span>
            </a>
            <a
              href="/tracking"
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-100"
            >
              <Package className="text-blue-500" size={20} />
              <span className="font-medium text-gray-700">Đơn mua gần đây</span>
            </a>
            <button
              onClick={() => {
                logout()
                router.push('/')
              }}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition text-red-600 font-medium"
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <User className="text-orange-500" /> Thông tin tài khoản
            </h3>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Địa chỉ Email
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Mail className="text-gray-400" size={18} />
                  <span className="font-semibold text-gray-900">
                    {user.email}
                  </span>
                </div>
                <p className="text-xs text-orange-600 mt-2">
                  * Vui lòng dùng email này khi thanh toán để được áp dụng
                  Voucher.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Số điện thoại
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Phone className="text-gray-400" size={18} />
                  <span className="font-medium text-gray-900">
                    {user.phone || 'Chưa cập nhật'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Địa chỉ mặc định
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="text-gray-400" size={18} />
                  <span className="font-medium text-gray-900">
                    {user.address || 'Chưa cập nhật'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <Button disabled variant="outline">
                Chỉnh sửa thông tin (Đang phát triển)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

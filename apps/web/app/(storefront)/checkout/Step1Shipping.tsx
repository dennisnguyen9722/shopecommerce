/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { Mail, User, Phone, MapPin } from 'lucide-react'
import { useAuthStore } from '@/src/store/authStore' // 👈 Import store

export default function Step1Address({ next }: { next: (data: any) => void }) {
  // Lấy thông tin user từ Store
  const { user, isAuthenticated } = useAuthStore()

  // Khởi tạo state rỗng trước
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  // ⭐ TỰ ĐỘNG ĐIỀN KHI VÀO TRANG
  useEffect(() => {
    if (isAuthenticated && user) {
      // Nếu đã đăng nhập -> Lấy thông tin lấp vào ô input
      setName(user.name || '')
      setEmail(user.email || '')
      setPhone(user.phone || '') // Nếu trong profile có sđt thì điền luôn
      setAddress(user.address || '') // Nếu trong profile có địa chỉ thì điền luôn
    }
  }, [isAuthenticated, user])

  const handleNext = () => {
    // Validation
    if (!name.trim()) return alert('Vui lòng nhập họ tên')
    if (!email.trim() || !email.includes('@'))
      return alert('Vui lòng nhập email hợp lệ')
    if (!phone.trim()) return alert('Vui lòng nhập số điện thoại')
    if (!address.trim()) return alert('Vui lòng nhập địa chỉ giao hàng')

    // Gửi data sang bước 2
    next({ name, email, phone, address })
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6 flex justify-between items-center">
        Thông tin giao hàng
        {/* Nút nhỏ gợi ý cho khách biết là đã tự điền */}
        {isAuthenticated && (
          <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
            ✨ Đã tự động điền từ hồ sơ của bạn
          </span>
        )}
      </h3>

      <div className="space-y-4">
        {/* Họ tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="w-full p-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              // Nếu đã login thì có thể disable ô này hoặc để readonly để tránh sửa nhầm email tài khoản (tuỳ bạn)
              // readOnly={isAuthenticated}
              className={`w-full p-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                isAuthenticated ? 'bg-gray-50 text-gray-600' : ''
              }`}
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Hóa đơn điện tử sẽ được gửi đến email này.
          </p>
        </div>

        {/* SĐT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              className="w-full p-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="0987654321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ giao hàng <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              className="w-full p-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="mt-6 w-full px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors shadow-lg hover:shadow-orange-200"
      >
        Giao đến địa chỉ này
      </button>
    </div>
  )
}

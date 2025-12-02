'use client'

import { useState } from 'react'
import { Mail, User, Phone, MapPin } from 'lucide-react'

export default function Step1Address({ next }: { next: (data: any) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('') // ✅ THÊM EMAIL
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const handleNext = () => {
    // ✅ Validation
    if (!name.trim()) {
      alert('Vui lòng nhập họ tên')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      alert('Vui lòng nhập email hợp lệ')
      return
    }
    if (!phone.trim()) {
      alert('Vui lòng nhập số điện thoại')
      return
    }
    if (!address.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng')
      return
    }

    next({ name, email, phone, address })
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Thông tin giao hàng</h3>

      <div className="space-y-4">
        {/* Họ tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="w-full p-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full p-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Hóa đơn sẽ được gửi đến email này
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
              className="w-full p-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full p-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
        className="mt-6 w-full px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors"
      >
        Tiếp tục
      </button>
    </div>
  )
}

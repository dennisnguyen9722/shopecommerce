'use client'

import {
  Search,
  MapPin,
  Phone,
  ShoppingCart,
  User,
  FileText
} from 'lucide-react'

interface NavbarTopProps {
  scrolled: boolean
}

export default function NavbarTop({ scrolled }: NavbarTopProps) {
  return (
    <div
      className={`
        w-full backdrop-blur-xl bg-white/80 border-b border-gray-200/50
        transition-all duration-300 shadow-sm
        ${scrolled ? 'py-2 shadow-lg' : 'py-3'}
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-6">
          {/* LEFT: Logo */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition" />
              <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-3 shadow-lg">
                <span className="text-white font-bold text-xl">🌐</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🍎</span>
              <div className="flex flex-col text-xs leading-tight">
                <span className="font-semibold text-gray-800">Authorized</span>
                <span className="font-semibold text-gray-600">Reseller</span>
              </div>
            </div>
          </div>

          {/* CENTER: Search & Location */}
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            {/* Location */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl text-white text-sm font-medium transition shadow-md hover:shadow-lg">
              <MapPin className="w-4 h-4" />
              <span>Hồ Chí Minh</span>
            </button>

            {/* Search Bar - Glassmorphism */}
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition" />
              <div className="relative backdrop-blur-md bg-white/60 border border-gray-200/50 rounded-2xl shadow-md hover:shadow-lg transition">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full px-5 py-3 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:shadow-md transition">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="group relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-100/80 backdrop-blur-sm transition">
              <Phone
                className="w-5 h-5 text-gray-700 group-hover:text-orange-600 transition"
                strokeWidth={1.5}
              />
              <span className="text-xs text-gray-600 group-hover:text-orange-600 transition">
                Hotline
              </span>
            </button>

            <button className="group relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-100/80 backdrop-blur-sm transition">
              <FileText
                className="w-5 h-5 text-gray-700 group-hover:text-orange-600 transition"
                strokeWidth={1.5}
              />
              <span className="text-xs text-gray-600 group-hover:text-orange-600 transition">
                Tra cứu
              </span>
            </button>

            <button className="group relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-100/80 backdrop-blur-sm transition">
              <User
                className="w-5 h-5 text-gray-700 group-hover:text-orange-600 transition"
                strokeWidth={1.5}
              />
              <span className="text-xs text-gray-600 group-hover:text-orange-600 transition">
                Tài khoản
              </span>
            </button>

            <button className="group relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-100/80 backdrop-blur-sm transition">
              <div className="relative">
                <ShoppingCart
                  className="w-5 h-5 text-gray-700 group-hover:text-orange-600 transition"
                  strokeWidth={1.5}
                />
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                  0
                </span>
              </div>
              <span className="text-xs text-gray-600 group-hover:text-orange-600 transition">
                Giỏ hàng
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

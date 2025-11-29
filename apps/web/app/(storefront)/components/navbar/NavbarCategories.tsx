'use client'

import { useState } from 'react'
import {
  Menu,
  Smartphone,
  Laptop,
  RefreshCcw,
  Tablet,
  Watch,
  Home,
  Headphones,
  Wrench,
  Tag,
  Percent,
  X
} from 'lucide-react'

const categories = [
  { name: 'Điện thoại', icon: Smartphone },
  { name: 'Macbook', icon: Laptop },
  { name: 'Máy cũ', icon: RefreshCcw },
  { name: 'Máy tính bảng', icon: Tablet },
  { name: 'Đồng hồ', icon: Watch },
  { name: 'Nhà thông minh', icon: Home },
  { name: 'Phụ kiện', icon: Headphones },
  { name: 'Âm thanh', icon: Headphones },
  { name: 'Sửa chữa', icon: Wrench },
  { name: 'Deal hời', icon: Tag },
  { name: 'Khuyến mãi', icon: Percent }
]

export default function NavbarCategories() {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full backdrop-blur-xl bg-gray-50/80 border-b border-gray-200/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* LEFT: Menu Icon for mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden group relative p-3 backdrop-blur-md bg-white/60 border border-gray-200/50 rounded-xl hover:bg-orange-500 hover:border-orange-500 transition shadow-sm hover:shadow-md"
          >
            {open ? (
              <X className="w-5 h-5 text-gray-700 group-hover:text-white" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700 group-hover:text-white" />
            )}
          </button>

          {/* Desktop Items */}
          <div className="hidden lg:flex items-center gap-6 flex-1">
            {categories.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  className="group relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/60 backdrop-blur-sm transition text-sm whitespace-nowrap"
                >
                  <Icon
                    className="w-[18px] h-[18px] text-gray-600 group-hover:text-orange-600 transition"
                    strokeWidth={1.5}
                  />
                  <span className="text-gray-700 group-hover:text-orange-600 font-medium">
                    {item.name}
                  </span>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 group-hover:w-full transition-all duration-300 rounded-full" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Mobile Dropdown */}
        {open && (
          <div className="lg:hidden animate-fade-down backdrop-blur-xl bg-white/80 border-t border-gray-200 py-4 grid grid-cols-2 gap-4">
            {categories.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  className="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition text-sm"
                >
                  <Icon className="w-5 h-5 text-gray-700" />
                  <span className="text-gray-700">{item.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

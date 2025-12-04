'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/src/lib/api'
import { LayoutGrid } from 'lucide-react'

interface Category {
  _id: string
  name: string
  slug: string
  icon?: {
    url: string
    public_id: string
  } | null
}

export default function NavbarCategories() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    api.get('/public/categories').then((res) => {
      setCategories(res.data || [])
    })
  }, [])

  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
          {/* Nút Tất cả sản phẩm */}
          <Link
            href="/products"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold transition-all duration-300 shrink-0 shadow-md hover:shadow-lg group"
          >
            <LayoutGrid
              size={16}
              className="text-white transition-transform group-hover:scale-110"
            />
            <span>Tất cả sản phẩm</span>
          </Link>

          {/* Vách ngăn */}
          <div className="w-px h-6 bg-gray-200 mx-1 shrink-0"></div>

          {/* Danh sách categories */}
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 text-gray-600 hover:text-orange-700 text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 border border-transparent hover:border-orange-200"
            >
              {cat.icon?.url ? (
                <img
                  src={cat.icon.url}
                  alt={cat.name}
                  className="w-5 h-5 object-contain opacity-80"
                />
              ) : (
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
              )}
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/src/lib/api'

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
    <nav className="w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6 overflow-x-auto no-scrollbar">
        {/* ALL PRODUCTS */}
        <Link
          href="/products"
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition whitespace-nowrap"
        >
          <span className="text-sm font-medium">Tất cả sản phẩm</span>
        </Link>

        {/* CATEGORY LIST */}
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/category/${cat.slug}`}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition whitespace-nowrap"
          >
            {/* ICON */}
            {cat.icon?.url ? (
              <img
                src={cat.icon.url}
                alt={cat.name}
                className="w-6 h-6 object-contain"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
            )}

            <span className="text-sm font-medium">{cat.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

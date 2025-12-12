'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Home,
  Headphones,
  Wrench,
  Tag
} from 'lucide-react'

export type Category = {
  _id: string
  name: string
  slug: string
  imageUrl?: string
}

export type Product = {
  _id: string
  name: string
  price: number | string | { $numberInt?: string; $numberLong?: string }
  comparePrice?:
    | number
    | string
    | { $numberInt?: string; $numberLong?: string }
    | null
  discountPercent?: number | string | null
  hasDiscount?: boolean
  createdAt?: string | Date | { $date?: string } | null
  images?: Array<any>
  slug: string
  category?: any
  isNew?: boolean
  isHot?: boolean
}

const categoryIcons: Record<string, any> = {
  'dien-thoai': Smartphone,
  laptop: Laptop,
  macbook: Laptop,
  'may-tinh-bang': Tablet,
  'dong-ho': Watch,
  'nha-thong-minh': Home,
  'phu-kien': Headphones,
  'am-thanh': Headphones,
  'sua-chua': Wrench,
  'deal-hoi': Tag
}

function toNumber(v: any): number | null {
  if (v == null) return null
  if (typeof v === 'number' && !isNaN(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  if (typeof v === 'object') {
    if (v.$numberInt) return toNumber(v.$numberInt)
    if (v.$numberLong) return toNumber(v.$numberLong)
  }
  return null
}

function toDate(v: any): Date | null {
  if (!v) return null
  if (v instanceof Date) return v
  if (typeof v === 'string') {
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof v === 'object') {
    if (v.$date) return toDate(v.$date)
    if (v.$numberLong) {
      const n = Number(v.$numberLong)
      if (!Number.isNaN(n)) return new Date(n)
    }
  }
  return null
}

function getProductImage(p: Product) {
  if (!p.images || p.images.length === 0) return null
  const img = p.images[0]
  if (typeof img === 'string') return img
  if (img?.url) return img.url
  if (img?.src) return img.src
  if (img?.path) return img.path
  return null
}

function computeBadgeInfo(p: Product) {
  const explicitPct = toNumber(p.discountPercent)
  const price = toNumber(p.price)
  const comparePrice = toNumber(p.comparePrice)

  let computedPct = 0
  if (comparePrice && price && comparePrice > price) {
    computedPct = Math.round(((comparePrice - price) / comparePrice) * 100)
  }

  const hasDiscountFlag = !!p.hasDiscount
  const created = toDate(p.createdAt)
  let isNew = false
  if (p.isNew) isNew = true
  else if (created) {
    const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
    if (days <= 14) isNew = true
  }

  let isHot = !!p.isHot
  if (!isHot && explicitPct && explicitPct >= 20) isHot = true
  if (!isHot && computedPct && computedPct >= 25) isHot = true

  const finalPct = explicitPct || computedPct || 0
  const hasDiscount = finalPct > 0 || hasDiscountFlag

  return { finalPct, hasDiscount, isNew, isHot }
}

export default function CategoryGrid({
  categories,
  products
}: {
  categories: Category[]
  products: Product[]
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const safeProducts = products || []
  const safeCategories = categories || []

  // 🔥 GIỚI HẠN MỖI CATEGORY CHỈ 10 SẢN PHẨM
  const LIMIT_PER_CATEGORY = 10

  const filteredProducts =
    selectedCategory === 'all'
      ? safeProducts.slice(0, LIMIT_PER_CATEGORY) // Limit cho "all"
      : safeProducts
          .filter((p) => {
            const slug =
              typeof p.category === 'object'
                ? p.category?.slug
                : safeCategories.find((c) => c._id === p.category)?.slug
            return slug === selectedCategory
          })
          .slice(0, LIMIT_PER_CATEGORY) // Limit cho mỗi category

  // Đếm tổng số products trong category (trước khi limit)
  const totalInCategory =
    selectedCategory === 'all'
      ? safeProducts.length
      : safeProducts.filter((p) => {
          const slug =
            typeof p.category === 'object'
              ? p.category?.slug
              : safeCategories.find((c) => c._id === p.category)?.slug
          return slug === selectedCategory
        }).length

  return (
    <section className="w-full py-16 relative overflow-hidden">
      {/* BACKGROUND ĐẸP HƠN */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50/30 to-white" />

      <div className="container mx-auto px-4 max-w-7xl space-y-8 relative z-10">
        {/* TIÊU ĐỀ ĐẸP HƠN */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">
            Khám phá bộ sưu tập
          </h2>
          <p className="text-gray-600">Chọn danh mục yêu thích của bạn</p>
        </div>

        {/* CATEGORY BUTTONS - ĐẸP HƠN NHIỀU */}
        <div className="relative">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`
                px-6 py-3 rounded-full 
                flex items-center gap-2 font-bold text-sm
                transition-all duration-300
                ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:scale-105'
                }
              `}
            >
              <Tag className="w-4 h-4" /> Tất cả
            </button>

            {safeCategories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Smartphone
              const active = selectedCategory === cat.slug

              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`
                    px-6 py-3 rounded-full 
                    flex items-center gap-2 font-bold text-sm
                    transition-all duration-300
                    ${
                      active
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg scale-105'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:scale-105'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" /> {cat.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* HEADER - HIỂN THỊ SỐ LƯỢNG */}
        <div className="flex items-center justify-between pt-4">
          <h3 className="text-xl font-bold text-gray-900">
            {selectedCategory === 'all'
              ? 'Tất cả sản phẩm'
              : safeCategories.find((c) => c.slug === selectedCategory)?.name}
          </h3>
          <div className="text-sm text-gray-500 font-medium">
            {filteredProducts.length} / {totalInCategory} sản phẩm
            {totalInCategory > LIMIT_PER_CATEGORY && (
              <span className="ml-2 text-orange-600">
                (Hiển thị {LIMIT_PER_CATEGORY} đầu tiên)
              </span>
            )}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">
              Không có sản phẩm nào trong danh mục này
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((p) => {
                const img = getProductImage(p)
                const { finalPct, hasDiscount, isNew, isHot } =
                  computeBadgeInfo(p)
                const price = toNumber(p.price)

                return (
                  <Link
                    key={p._id}
                    href={`/products/${p.slug}`}
                    className="
                      group relative rounded-3xl overflow-hidden
                      bg-white border border-gray-200
                      hover:shadow-xl hover:border-orange-300
                      transition-all duration-300 hover:-translate-y-1
                      p-4 block
                    "
                  >
                    {/* BADGES ĐỨNG DỌC */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                      {finalPct > 0 && (
                        <div className="px-2.5 py-1 text-xs font-black rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md">
                          -{finalPct}%
                        </div>
                      )}
                      {isNew && (
                        <div className="px-2.5 py-1 text-xs font-black rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-white shadow-md">
                          ✨ NEW
                        </div>
                      )}
                      {!finalPct && !isNew && isHot && (
                        <div className="px-2.5 py-1 text-xs font-black rounded-full bg-gradient-to-r from-yellow-400 to-red-500 text-white shadow-md">
                          🔥 HOT
                        </div>
                      )}
                    </div>

                    {/* HÌNH ẢNH */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3">
                      {img ? (
                        <Image
                          src={img}
                          fill
                          alt={p.name}
                          className="object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Smartphone className="w-12 h-12" />
                        </div>
                      )}
                    </div>

                    {/* TÊN SẢN PHẨM */}
                    <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-orange-600 transition-colors">
                      {p.name}
                    </h3>

                    {/* GIÁ */}
                    <p className="text-lg font-black text-orange-600">
                      {price ? price.toLocaleString('vi-VN') + '₫' : '-'}
                    </p>
                  </Link>
                )
              })}
            </div>

            {/* VIEW MORE BUTTON */}
            {totalInCategory > LIMIT_PER_CATEGORY && (
              <div className="flex justify-center pt-6">
                <Link
                  href={
                    selectedCategory === 'all'
                      ? '/products'
                      : `/category/${selectedCategory}`
                  }
                  className="
                    px-8 py-3 rounded-full 
                    bg-gradient-to-r from-orange-500 to-pink-500 
                    text-white font-bold text-sm
                    hover:shadow-lg hover:scale-105
                    transition-all duration-300
                    flex items-center gap-2
                  "
                >
                  Xem thêm {totalInCategory - LIMIT_PER_CATEGORY} sản phẩm
                  <span className="text-lg">→</span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

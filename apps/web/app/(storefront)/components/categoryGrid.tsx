'use client'

import { useState } from 'react'
import Image from 'next/image'
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

/* ============================================
   TYPES
============================================ */
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

/* ============================================
   ICON MAPPING
============================================ */
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

/* ============================================
   UTIL: robust conversions
============================================ */
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

/* ============================================
   IMAGE helper
============================================ */
function getProductImage(p: Product) {
  if (!p.images || p.images.length === 0) return null
  const img = p.images[0]
  if (typeof img === 'string') return img
  if (img?.url) return img.url
  if (img?.src) return img.src
  if (img?.path) return img.path
  return null
}

/* ============================================
   COMPUTE badge info
============================================ */
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

  return {
    finalPct,
    hasDiscount,
    isNew,
    isHot
  }
}

/* ============================================
   MAIN UI
============================================ */
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

  const filteredProducts =
    selectedCategory === 'all'
      ? safeProducts
      : safeProducts.filter((p) => {
          const slug =
            typeof p.category === 'object'
              ? p.category?.slug
              : safeCategories.find((c) => c._id === p.category)?.slug
          return slug === selectedCategory
        })

  return (
    <section className="w-full py-16">
      <div className="container mx-auto px-4 max-w-7xl space-y-10">
        {/* CATEGORY STRIP */}
        <div className="flex overflow-x-auto gap-4 pb-3 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              flex-shrink-0 px-5 py-3 rounded-2xl 
              flex items-center gap-3 border backdrop-blur-xl
              transition-all duration-300
              ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white border-orange-400 shadow-lg scale-[1.03]'
                  : 'bg-white/40 border-gray-200/40 text-gray-700 hover:bg-white/70'
              }
            `}
          >
            <Tag className="w-5 h-5" /> Tất cả
          </button>

          {safeCategories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Smartphone
            const active = selectedCategory === cat.slug

            return (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`
                  flex-shrink-0 px-5 py-3 rounded-2xl flex items-center gap-3 
                  border backdrop-blur-xl transition-all duration-300
                  ${
                    active
                      ? 'bg-orange-500 text-white border-orange-400 shadow-lg scale-[1.03]'
                      : 'bg-white/40 border-gray-200/40 text-gray-700 hover:bg-white/70'
                  }
                `}
              >
                <Icon className="w-5 h-5" /> {cat.name}
              </button>
            )
          })}
        </div>

        {/* PRODUCT GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedCategory === 'all'
                ? 'Tất cả sản phẩm'
                : safeCategories.find((c) => c.slug === selectedCategory)?.name}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredProducts.length} sản phẩm
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white/60 rounded-2xl border border-gray-200/50 backdrop-blur-xl">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">
                Không có sản phẩm nào trong danh mục này
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => {
                const img = getProductImage(p)
                const { finalPct, hasDiscount, isNew, isHot } =
                  computeBadgeInfo(p)

                return (
                  <div
                    key={p._id}
                    className="
                      group relative rounded-3xl overflow-hidden
                      bg-white/50 border border-gray-200/40 backdrop-blur-xl
                      shadow-[0_5px_20px_rgba(0,0,0,0.05)]
                      hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]
                      transition-all duration-300 hover:-translate-y-1
                      p-4
                    "
                  >
                    {/* MULTI BADGE */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                      {/* Giảm giá */}
                      {finalPct > 0 && (
                        <div
                          className="px-3 py-1.5 text-xs font-bold rounded-full shadow-lg 
                            bg-gradient-to-br from-orange-500 to-red-500 text-white"
                        >
                          Giảm {finalPct}%
                        </div>
                      )}

                      {/* Mới */}
                      {isNew && (
                        <div
                          className="px-3 py-1.5 text-xs font-bold rounded-full shadow-lg 
                            bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                        >
                          ✨ Mới
                        </div>
                      )}

                      {/* Hot (chỉ khi không giảm + không mới) */}
                      {!finalPct && !isNew && isHot && (
                        <div
                          className="px-3 py-1.5 text-xs font-bold rounded-full shadow-lg 
                            bg-gradient-to-br from-pink-500 to-red-500 text-white"
                        >
                          🔥 Hot
                        </div>
                      )}
                    </div>

                    <div className="relative w-full aspect-square rounded-2xl bg-gray-100 overflow-hidden mb-4">
                      {img ? (
                        <Image
                          src={img}
                          fill
                          alt={p.name}
                          className="object-contain p-4 transition-all duration-500 group-hover:scale-110"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Smartphone className="w-16 h-16" />
                        </div>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {p.name}
                    </h3>

                    <p className="text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                      {toNumber(p.price)
                        ? toNumber(p.price)!.toLocaleString('vi-VN') + '₫'
                        : '-'}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

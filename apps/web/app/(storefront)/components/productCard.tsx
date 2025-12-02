'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Smartphone, ShoppingCart, Eye, Heart } from 'lucide-react'
import { useState } from 'react'
import { useWishlist } from '@/app/contexts/WishlistContext'
import { useCart } from '@/app/contexts/CartContext'
import { useToast } from '@/app/(storefront)/components/ToastProvider'

export type ProductCardType = {
  _id: string
  name: string
  slug: string
  images?: Array<{ url: string } | string>
  price: number
  comparePrice?: number | null
  discountPercent?: number | null
  hasDiscount?: boolean
  isNew?: boolean
  isHot?: boolean
  description?: string
  category?: { name: string; slug: string }
}

function formatPrice(n?: number | null) {
  if (!n || n <= 0) return null
  return n.toLocaleString('vi-VN') + '₫'
}

export default function ProductCard({ product, onQuickView }: any) {
  const { showToast } = useToast()
  const [isHovered, setIsHovered] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const inWishlist = isInWishlist(product._id)

  const rawImg = product.images?.[0] ?? null
  const img = typeof rawImg === 'string' ? rawImg : rawImg?.url ?? null

  const compare =
    typeof product.comparePrice === 'number' && product.comparePrice > 0
      ? product.comparePrice
      : undefined

  const hasDiscount =
    product.hasDiscount === true ||
    (typeof compare === 'number' && compare > product.price)

  const discountPct =
    typeof product.discountPercent === 'number'
      ? product.discountPercent
      : typeof compare === 'number' && compare > product.price
      ? Math.round(((compare - product.price) / compare) * 100)
      : 0

  const priceStr = formatPrice(product.price)
  const compareStr = formatPrice(compare)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="
        group relative rounded-3xl overflow-hidden
        shadow-[0_8px_30px_rgba(0,0,0,0.04)]
        hover:shadow-[0_20px_60px_rgba(255,100,50,0.15)]
        transition-all duration-500 hover:-translate-y-2
        bg-transparent
      "
    >
      {/* BADGES */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
        {hasDiscount && discountPct > 0 && (
          <div
            className="px-3 py-1.5 text-xs font-black rounded-full 
            bg-gradient-to-r from-red-500 via-pink-500 to-orange-500
            text-white shadow-xl animate-pulse"
          >
            -{discountPct}%
          </div>
        )}

        {product.isNew && (
          <div
            className="px-3 py-1.5 text-xs font-black rounded-full 
            bg-gradient-to-r from-emerald-400 to-cyan-500
            text-white shadow-xl"
          >
            ✨ NEW
          </div>
        )}

        {product.isHot && !hasDiscount && (
          <div
            className="px-3 py-1.5 text-xs font-black rounded-full 
            bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500
            text-white shadow-xl"
          >
            🔥 HOT
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div
        className={`
          absolute top-3 right-3 z-30 flex flex-col gap-2
          transition-all duration-300
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
        `}
      >
        <button
          onClick={(e) => {
            e.preventDefault()
            inWishlist
              ? removeFromWishlist(product._id)
              : addToWishlist(product)
          }}
          className={`
            p-2.5 rounded-full bg-white shadow-lg hover:shadow-xl 
            transition-all duration-300 hover:scale-110
            ${inWishlist ? 'text-red-500' : 'text-gray-700'}
          `}
        >
          <Heart className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault()
            onQuickView?.(product)
          }}
          className="
            p-2.5 rounded-full bg-white shadow-lg hover:shadow-xl 
            transition-all duration-300 hover:scale-110
          "
        >
          <Eye className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      <Link href={`/products/${product.slug}`} className="block">
        {/* IMAGE AREA */}
        {/* IMAGE */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4">
          {img ? (
            <Image
              src={img}
              alt={product.name}
              fill
              className="
        object-contain p-4 z-10 relative
        transition-all duration-700
        group-hover:scale-110 group-hover:rotate-3
      "
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Smartphone className="w-20 h-20" />
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="px-4 pb-4 space-y-3">
          <h3
            className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 min-h-[2.5rem]
              group-hover:text-transparent group-hover:bg-gradient-to-r 
              group-hover:from-orange-500 group-hover:to-pink-500 
              group-hover:bg-clip-text transition-all duration-300
            "
          >
            {product.name}
          </h3>

          {/* PRICE */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                {priceStr ?? '-'}
              </div>

              {hasDiscount && compareStr && (
                <div className="text-xs text-gray-400 line-through font-medium">
                  {compareStr}
                </div>
              )}
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            onClick={(e) => {
              e.preventDefault()
              addToCart({
                _id: product._id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                quantity: 1,
                image: img
              })
              showToast(product.name, product.images?.[0]?.url)
            }}
            className={`
              w-full py-2.5 rounded-xl font-bold text-sm
              bg-gradient-to-r from-orange-500 to-pink-500
              text-white shadow-lg
              transition-all duration-300
              flex items-center justify-center gap-2
              ${
                isHovered
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2'
              }
              hover:shadow-xl hover:scale-[1.02]
            `}
          >
            <ShoppingCart className="w-4 h-4" />
            Thêm vào giỏ
          </button>
        </div>
      </Link>
    </div>
  )
}

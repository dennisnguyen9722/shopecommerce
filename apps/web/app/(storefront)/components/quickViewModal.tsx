/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { X, ShoppingCart, Heart, Share2, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWishlist } from '@/app/contexts/WishlistContext'

type Product = {
  _id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  discountPercent?: number | null
  images?: Array<{ url: string } | string>
  description?: string
  category?: { name: string; slug: string }
  isNew?: boolean
  isHot?: boolean
  hasDiscount?: boolean
}

type QuickViewModalProps = {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

function formatPrice(n?: number | null) {
  if (n == null || typeof n !== 'number' || Number.isNaN(n)) return null
  return n.toLocaleString('vi-VN') + '₫'
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose
}: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const inWishlist = product ? isInWishlist(product._id) : false

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Reset khi đóng
  useEffect(() => {
    if (!isOpen) {
      setQuantity(1)
      setSelectedImage(0)
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const images = product.images || []
  const mainImage = images[selectedImage]
  const imgUrl = typeof mainImage === 'string' ? mainImage : mainImage?.url

  const comparePrice =
    typeof product.comparePrice === 'number' && product.comparePrice > 0
      ? product.comparePrice
      : undefined

  const hasDiscount = comparePrice && comparePrice > product.price

  const discountPct = hasDiscount
    ? Math.round(((comparePrice - product.price) / comparePrice) * 100)
    : 0

  const handleWishlistToggle = () => {
    if (!product) return
    if (inWishlist) {
      removeFromWishlist(product._id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* BACKDROP - BLUR FULL MÀN HÌNH */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* MODAL CONTAINER */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="
            relative w-full max-w-6xl
            bg-white rounded-3xl shadow-2xl
            animate-scale-in
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="
              absolute top-4 right-4 z-20
              w-10 h-10 rounded-full bg-white shadow-xl
              flex items-center justify-center
              hover:bg-gray-100 transition-all hover:rotate-90
              group
            "
          >
            <X className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* LEFT: IMAGES */}
            <div className="space-y-4">
              {/* BADGES - CHỈ HIỆN KHI CÓ */}
              {(hasDiscount || product.isNew || product.isHot) && (
                <div className="flex gap-2 mb-4">
                  {hasDiscount && discountPct > 0 && (
                    <div className="px-3 py-1.5 text-xs font-black rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg">
                      -{discountPct}%
                    </div>
                  )}
                  {product.isNew && (
                    <div className="px-3 py-1.5 text-xs font-black rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-white shadow-lg">
                      ✨ NEW
                    </div>
                  )}
                  {product.isHot && !hasDiscount && (
                    <div className="px-3 py-1.5 text-xs font-black rounded-full bg-gradient-to-r from-yellow-400 to-red-500 text-white shadow-lg">
                      🔥 HOT
                    </div>
                  )}
                </div>
              )}

              {/* MAIN IMAGE */}
              <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-8"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <span className="text-6xl">📦</span>
                  </div>
                )}
              </div>

              {/* THUMBNAIL IMAGES */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, idx) => {
                    const thumbUrl = typeof img === 'string' ? img : img?.url
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`
                          relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden
                          border-2 transition-all
                          ${
                            idx === selectedImage
                              ? 'border-orange-500 scale-105 shadow-lg'
                              : 'border-gray-200 hover:border-orange-300'
                          }
                        `}
                      >
                        {thumbUrl && (
                          <Image
                            src={thumbUrl}
                            alt={`${product.name} ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: INFO */}
            <div className="space-y-5">
              {/* CATEGORY */}
              {product.category && (
                <div className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-sm font-semibold rounded-full">
                  {product.category.name}
                </div>
              )}

              {/* NAME */}
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                {product.name}
              </h2>

              {/* PRICE */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && comparePrice && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(comparePrice)}
                    </span>
                  )}
                </div>
                {hasDiscount && comparePrice && (
                  <div className="inline-block px-3 py-1 bg-green-50 text-green-600 text-sm font-bold rounded-full">
                    Tiết kiệm {formatPrice(comparePrice - product.price)}
                  </div>
                )}
              </div>

              {/* DESCRIPTION - CHỈ HIỆN TEXT, KHÔNG HIỆN HTML */}
              {product.description && (
                <div className="prose prose-sm max-w-none">
                  <div
                    className="text-gray-600 leading-relaxed line-clamp-4"
                    dangerouslySetInnerHTML={{
                      __html:
                        product.description
                          .replace(/<[^>]*>/g, ' ') // Xóa HTML tags
                          .replace(/\s+/g, ' ') // Xóa khoảng trắng thừa
                          .trim()
                          .substring(0, 200) + '...'
                    }}
                  />
                </div>
              )}

              {/* QUANTITY SELECTOR */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Số lượng
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 flex items-center justify-center transition-all"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-24 h-12 text-center border-2 border-gray-200 rounded-xl text-xl font-bold focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 flex items-center justify-center transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3 pt-4">
                <button
                  className="
                  w-full py-4 rounded-xl font-bold text-lg
                  bg-gradient-to-r from-orange-500 to-pink-500
                  text-white shadow-lg
                  hover:shadow-xl hover:scale-[1.02]
                  transition-all duration-300
                  flex items-center justify-center gap-2
                "
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ hàng
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleWishlistToggle}
                    className={`
                      py-3 rounded-xl font-medium
                      border-2 transition-all duration-300
                      flex items-center justify-center gap-2
                      ${
                        inWishlist
                          ? 'border-red-500 bg-red-50 text-red-500'
                          : 'border-gray-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50'
                      }
                    `}
                  >
                    <Heart
                      className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`}
                    />
                    {inWishlist ? 'Đã thích' : 'Yêu thích'}
                  </button>
                  <button
                    className="
                    py-3 rounded-xl font-medium
                    border-2 border-gray-200
                    hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50
                    transition-all duration-300
                    flex items-center justify-center gap-2
                  "
                  >
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
                  </button>
                </div>

                {/* VIEW FULL DETAILS */}
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="
                    block text-center py-3 rounded-xl
                    bg-gray-100 text-gray-700 font-semibold
                    hover:bg-gray-200 transition-all
                  "
                >
                  Xem chi tiết đầy đủ →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

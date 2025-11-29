'use client'

import { X, ShoppingCart, Heart, Share2, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'

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

  if (!isOpen || !product) return null

  const images = product.images || []
  const mainImage = images[selectedImage]
  const imgUrl = typeof mainImage === 'string' ? mainImage : mainImage?.url

  const comparePrice =
    typeof product.comparePrice === 'number' ? product.comparePrice : undefined
  const hasDiscount =
    product.hasDiscount || (comparePrice && comparePrice > product.price)
  const discountPct =
    product.discountPercent ||
    (comparePrice && comparePrice > product.price
      ? Math.round(((comparePrice - product.price) / comparePrice) * 100)
      : 0)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* MODAL WRAPPER - with proper centering */}
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          className="
              relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl
              transform transition-all duration-300
            "
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="
                absolute top-4 right-4 z-20
                w-10 h-10 rounded-full bg-white shadow-md
                flex items-center justify-center
                hover:bg-gray-100 transition-all hover:rotate-90
                group
              "
          >
            <X className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 p-6 md:p-8">
            {/* LEFT: IMAGES */}
            <div className="space-y-4">
              {/* BADGES */}
              <div className="flex gap-2 flex-wrap">
                {hasDiscount && discountPct > 0 && (
                  <div className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                    -{discountPct}%
                  </div>
                )}
                {product.isNew && (
                  <div className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-white">
                    ✨ NEW
                  </div>
                )}
                {product.isHot && (
                  <div className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-400 to-red-500 text-white">
                    🔥 HOT
                  </div>
                )}
              </div>

              {/* MAIN IMAGE */}
              <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
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
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => {
                    const thumbUrl = typeof img === 'string' ? img : img?.url
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`
                            relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden
                            border-2 transition-all
                            ${
                              idx === selectedImage
                                ? 'border-orange-500 scale-105'
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
            <div className="flex flex-col space-y-5">
              {/* CATEGORY */}
              {product.category && (
                <div className="text-sm text-gray-500">
                  Danh mục:{' '}
                  <span className="text-orange-600 font-medium">
                    {product.category.name}
                  </span>
                </div>
              )}

              {/* NAME */}
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h2>

              {/* PRICE */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl md:text-3xl font-black text-orange-600">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && comparePrice && (
                    <span className="text-base text-gray-400 line-through">
                      {formatPrice(comparePrice)}
                    </span>
                  )}
                </div>
                {hasDiscount && comparePrice && (
                  <div className="text-sm text-green-600 font-semibold">
                    Tiết kiệm {formatPrice(comparePrice - product.price)}
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              {product.description && (
                <div className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {product.description}
                </div>
              )}

              {/* QUANTITY SELECTOR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg border border-gray-300 hover:border-orange-500 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 h-9 text-center border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-lg border border-gray-300 hover:border-orange-500 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3 pt-2">
                <button
                  className="
                    w-full py-3.5 rounded-lg font-bold text-base
                    bg-gradient-to-r from-orange-500 to-pink-500
                    text-white shadow-lg
                    hover:shadow-xl hover:scale-[1.02]
                    transition-all duration-200
                    flex items-center justify-center gap-2
                  "
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ hàng
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="
                      py-2.5 rounded-lg font-medium text-sm
                      border border-gray-300
                      hover:border-red-500 hover:text-red-500 hover:bg-red-50
                      transition-all duration-200
                      flex items-center justify-center gap-2
                    "
                  >
                    <Heart className="w-4 h-4" />
                    Yêu thích
                  </button>
                  <button
                    className="
                      py-2.5 rounded-lg font-medium text-sm
                      border border-gray-300
                      hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50
                      transition-all duration-200
                      flex items-center justify-center gap-2
                    "
                  >
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
                  </button>
                </div>
              </div>

              {/* VIEW FULL DETAILS */}
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="
                    block text-center py-3 rounded-lg
                    bg-gray-100 text-gray-700 font-medium text-sm
                    hover:bg-gray-200 transition-colors
                  "
              >
                Xem chi tiết đầy đủ →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

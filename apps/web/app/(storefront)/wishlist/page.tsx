'use client'

import { useWishlist } from '@/app/contexts/WishlistContext'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'

function formatPrice(n?: number | null) {
  if (n == null || typeof n !== 'number' || Number.isNaN(n)) return null
  return n.toLocaleString('vi-VN') + '₫'
}

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist()

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center">
              <Heart className="w-16 h-16 text-orange-500" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">
              Danh sách yêu thích trống
            </h1>
            <p className="text-gray-600 mb-8">
              Bạn chưa thêm sản phẩm nào vào danh sách yêu thích
            </p>
            <Link
              href="/"
              className="
                inline-flex items-center gap-2 px-8 py-4 rounded-2xl
                bg-gradient-to-r from-orange-500 to-pink-500
                text-white font-bold text-lg
                shadow-lg hover:shadow-xl hover:scale-105
                transition-all duration-300
              "
            >
              <ArrowLeft className="w-5 h-5" />
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                💖 Danh sách yêu thích
              </h1>
              <p className="text-gray-600 mt-2">
                Bạn có {wishlist.length} sản phẩm yêu thích
              </p>
            </div>
          </div>
        </div>

        {/* WISHLIST GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {wishlist.map((product) => {
            const rawImg = product.images?.[0] ?? null
            const img = typeof rawImg === 'string' ? rawImg : rawImg?.url

            const comparePrice =
              typeof product.comparePrice === 'number' &&
              product.comparePrice > 0
                ? product.comparePrice
                : undefined

            const hasDiscount = comparePrice && comparePrice > product.price

            const discountPct = hasDiscount
              ? Math.round(
                  ((comparePrice - product.price) / comparePrice) * 100
                )
              : 0

            return (
              <div
                key={product._id}
                className="
                  group relative rounded-3xl overflow-hidden
                  bg-white border border-gray-200
                  shadow-lg hover:shadow-xl
                  transition-all duration-300 hover:-translate-y-1
                  p-4
                "
              >
                {/* REMOVE BUTTON */}
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="
                    absolute top-3 right-3 z-10
                    w-8 h-8 rounded-full bg-white shadow-lg
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-all duration-300
                    hover:bg-red-500 hover:text-white
                  "
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* BADGE */}
                {(hasDiscount || product.isNew || product.isHot) && (
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                    {hasDiscount && discountPct > 0 && (
                      <div className="px-2.5 py-1 text-xs font-black rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md">
                        -{discountPct}%
                      </div>
                    )}
                    {product.isNew && (
                      <div className="px-2.5 py-1 text-xs font-black rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-white shadow-md">
                        ✨ NEW
                      </div>
                    )}
                    {product.isHot && !hasDiscount && (
                      <div className="px-2.5 py-1 text-xs font-black rounded-full bg-gradient-to-r from-yellow-400 to-red-500 text-white shadow-md">
                        🔥 HOT
                      </div>
                    )}
                  </div>
                )}

                <Link href={`/product/${product.slug}`} className="block">
                  {/* IMAGE */}
                  <div className="relative w-full aspect-square rounded-2xl bg-gray-50 overflow-hidden mb-3">
                    {img ? (
                      <Image
                        src={img}
                        fill
                        alt={product.name}
                        className="object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>

                  {/* NAME */}
                  <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-orange-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* PRICE */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-orange-600">
                        {formatPrice(product.price)}
                      </span>
                      {hasDiscount && comparePrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* ADD TO CART BUTTON */}
                <button
                  onClick={() => {
                    // TODO: Add to cart
                  }}
                  className="
                    w-full mt-3 py-2.5 rounded-xl font-bold text-sm
                    bg-gradient-to-r from-orange-500 to-pink-500
                    text-white shadow-md
                    hover:shadow-lg hover:scale-[1.02]
                    transition-all duration-300
                    flex items-center justify-center gap-2
                  "
                >
                  <ShoppingCart className="w-4 h-4" />
                  Thêm vào giỏ
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

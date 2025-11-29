'use client'

import Link from 'next/link'
import Image from 'next/image'

type ProductCardProps = {
  product: {
    _id: string
    name: string
    slug: string
    price: number
    comparePrice?: number
    discountPercent?: number
    images?: { url: string }[]
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.comparePrice &&
    product.comparePrice > 0 &&
    product.comparePrice > product.price

  const discountPercent =
    hasDiscount && product.discountPercent ? product.discountPercent : 0

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block rounded-2xl border border-gray-100 hover:shadow-md transition bg-white overflow-hidden"
    >
      {/* IMAGE */}
      <div className="relative w-full aspect-[4/3] bg-gray-50 flex items-center justify-center">
        {product.images?.[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

        {/* DISCOUNT BADGE */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow">
            Giảm {discountPercent}%
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>

        {/* PRICE */}
        <div className="flex items-center gap-2">
          <span className="text-red-600 font-semibold">
            {product.price.toLocaleString('vi-VN')}₫
          </span>

          {/* ORIGINAL PRICE — ONLY SHOW IF VALID */}
          {hasDiscount && product.comparePrice ? (
            <span className="text-gray-400 line-through text-xs">
              {product.comparePrice.toLocaleString('vi-VN')}₫
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

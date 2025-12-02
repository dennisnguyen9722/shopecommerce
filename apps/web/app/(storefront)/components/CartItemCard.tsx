'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useCart } from '@/app/contexts/CartContext'

export default function CartItemCard({ item }: any) {
  const { increase, decrease, removeFromCart } = useCart()

  return (
    <div
      className="
      flex items-center gap-6 bg-white rounded-2xl p-5 shadow-md 
      border border-gray-100 hover:shadow-lg transition
    "
    >
      {/* IMAGE */}
      <div className="relative w-28 h-28 flex-shrink-0">
        <Image
          src={item.image || ''}
          alt={item.name}
          fill
          className="object-contain"
        />
      </div>

      {/* CONTENT */}
      <div className="flex-1">
        <Link
          href={`/products/${item.slug}`}
          className="font-semibold text-gray-800 hover:text-orange-600"
        >
          {item.name}
        </Link>

        <div className="mt-1 text-orange-600 font-bold text-lg">
          {item.price.toLocaleString('vi-VN')}₫
        </div>

        {/* QUANTITY */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => decrease(item._id)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-8 text-center font-medium text-gray-700">
            {item.quantity}
          </span>

          <button
            onClick={() => increase(item._id)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DELETE */}
      <button
        onClick={() => removeFromCart(item._id)}
        className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
}

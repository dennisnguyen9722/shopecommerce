'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useCart } from '@/app/contexts/CartContext'

export default function CartItemCard({ item }: any) {
  const { updateQuantity, removeFromCart } = useCart()

  return (
    <div
      className="
      flex items-center gap-6 bg-white rounded-2xl p-5 shadow-md 
      border border-gray-100 hover:shadow-lg transition
    "
    >
      {/* IMAGE */}
      <div className="relative w-28 h-28 shrink-0">
        <Image
          src={item.image || '/placeholder.png'}
          alt={item.name}
          fill
          className="object-contain rounded-md"
        />
      </div>

      {/* CONTENT */}
      <div className="flex-1">
        <Link
          href={`/products/${item.slug}`}
          className="font-semibold text-gray-800 hover:text-orange-600 line-clamp-1"
        >
          {item.name}
        </Link>

        {/* HIỂN THỊ BIẾN THỂ */}
        {item.variantName && (
          <p className="text-sm text-gray-500 mt-1">
            Phân loại: <span className="font-medium">{item.variantName}</span>
          </p>
        )}

        <div className="mt-2 text-orange-600 font-bold text-lg">
          {item.price.toLocaleString('vi-VN')}₫
        </div>

        {/* QUANTITY CONTROL */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => {
              if (item.quantity > 1) {
                // SỬA LẠI THỨ TỰ: id -> quantity -> variantId
                updateQuantity(item._id, item.quantity - 1, item.variantId)
              }
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-8 text-center font-medium text-gray-700">
            {item.quantity}
          </span>

          <button
            // SỬA LẠI THỨ TỰ: id -> quantity -> variantId
            onClick={() =>
              updateQuantity(item._id, item.quantity + 1, item.variantId)
            }
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DELETE BUTTON */}
      <button
        // Hàm xóa thì thứ tự đúng rồi: id -> variantId
        onClick={() => removeFromCart(item._id, item.variantId)}
        className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
        title="Xóa khỏi giỏ hàng"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
}

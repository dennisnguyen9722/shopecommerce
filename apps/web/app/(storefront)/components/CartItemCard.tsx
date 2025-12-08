'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/app/contexts/CartContext'

export default function CartItemCard({ item }: { item: any }) {
  const { updateQuantity, removeFromCart } = useCart()

  const handleIncrease = () => {
    updateQuantity(item._id, item.quantity + 1, item.variantId)
  }

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item._id, item.quantity - 1, item.variantId)
    }
  }

  const handleRemove = () => {
    removeFromCart(item._id, item.variantId)
  }

  return (
    <div className="flex gap-4 p-4 !bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
      {/* IMAGE */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center !text-gray-400 text-xs">
            No image
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold !text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">
            {item.name}
          </h3>

          {/* VARIANT INFO */}
          {item.variantLabel && (
            <p className="text-xs sm:text-sm !text-gray-500 mb-2">
              <span className="font-medium !text-gray-700">
                {item.variantLabel}
              </span>
            </p>
          )}

          {/* PRICE */}
          <p className="text-base sm:text-lg font-bold text-orange-600">
            {item.price.toLocaleString('vi-VN')}₫
          </p>
        </div>

        {/* QUANTITY CONTROLS */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              className="p-1.5 sm:p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3 h-3 sm:w-4 sm:h-4 !text-gray-700" />
            </button>

            <span className="px-3 sm:px-4 py-1 sm:py-1.5 !text-gray-900 font-semibold text-sm min-w-[2.5rem] text-center border-x border-gray-300">
              {item.quantity}
            </span>

            <button
              onClick={handleIncrease}
              className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 !text-gray-700" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
            title="Xóa khỏi giỏ hàng"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* SUBTOTAL (Desktop only) */}
      <div className="hidden lg:flex flex-col items-end justify-between min-w-[120px]">
        <button
          onClick={handleRemove}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Xóa"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <div className="text-right">
          <p className="text-xs !text-gray-500 mb-1">Thành tiền:</p>
          <p className="text-lg font-bold text-orange-600">
            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
          </p>
        </div>
      </div>
    </div>
  )
}

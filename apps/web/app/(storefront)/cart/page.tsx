'use client'

import { useCart } from '@/app/contexts/CartContext'
import CartItemCard from '../components/CartItemCard'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMemo } from 'react'

export default function CartPage() {
  const { cart } = useCart()
  const router = useRouter()

  // Tính tổng tiền ở đây (sẽ tự tính lại khi giỏ hàng thay đổi)
  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cart])

  if (cart.length === 0)
    return (
      <div className="!bg-white min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl py-10 text-center">
          <h1 className="text-2xl font-bold mb-4 !text-gray-900">
            Giỏ hàng trống
          </h1>
          <p className="!text-gray-600 mb-6">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    )

  return (
    <div className="!bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl py-8">
        <h1 className="text-2xl font-bold mb-6 !text-gray-900">
          Giỏ hàng của bạn ({cart.length} sản phẩm)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <CartItemCard
                key={`${item._id}-${item.variantId || 'default'}`}
                item={item}
              />
            ))}
          </div>

          {/* RIGHT: TỔNG TIỀN */}
          <div className="lg:col-span-1">
            <div className="p-6 !bg-white rounded-xl shadow-md border border-gray-200 sticky top-4">
              <h2 className="text-lg font-bold mb-4 !text-gray-900">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm !text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-semibold !text-gray-900">
                    {totalPrice.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex justify-between text-sm !text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold !text-gray-900">Tính sau</span>
                </div>
              </div>

              <div className="flex justify-between text-base font-bold mb-6 !text-gray-900">
                <span>Tổng cộng:</span>
                <span className="text-orange-600 text-xl">
                  {totalPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="
                  w-full py-3.5 rounded-xl bg-gradient-to-r 
                  from-orange-500 to-red-500 text-white font-bold text-base
                  shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]
                  active:scale-95
                "
              >
                Tiến hành thanh toán
              </button>

              <Link
                href="/"
                className="block text-center mt-4 !text-gray-600 hover:text-orange-600 font-medium transition-colors text-sm"
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

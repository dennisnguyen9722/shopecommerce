'use client'

import { useCart } from '@/app/contexts/CartContext'
import CartItemCard from '../components/CartItemCard'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMemo } from 'react' // Thêm import này

export default function CartPage() {
  // Bỏ totalPrice ra khỏi destructuring vì Context không trả về
  const { cart } = useCart()
  const router = useRouter()

  // Tính tổng tiền ở đây (sẽ tự tính lại khi giỏ hàng thay đổi)
  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cart])

  if (cart.length === 0)
    return (
      <div className="container mx-auto px-4 max-w-4xl py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
        <Link
          href="/"
          className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    )

  return (
    <div className="container mx-auto px-4 max-w-5xl py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* LEFT */}
      <div className="lg:col-span-2 space-y-4">
        {cart.map((item) => (
          // Key kết hợp ID và VariantID
          <CartItemCard
            key={`${item._id}-${item.variantId || 'default'}`}
            item={item}
          />
        ))}
      </div>

      {/* RIGHT: TỔNG TIỀN */}
      <div className="p-6 bg-white rounded-2xl shadow-lg border">
        <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>

        <div className="flex justify-between text-lg font-semibold mb-3">
          <span>Tổng tiền:</span>
          <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
        </div>

        <button
          onClick={() => router.push('/checkout')}
          className="
            w-full mt-6 py-3 rounded-xl bg-linear-to-r 
            from-orange-500 to-pink-500 text-white font-bold text-base
            shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]
          "
        >
          Tiến hành thanh toán
        </button>
      </div>
    </div>
  )
}

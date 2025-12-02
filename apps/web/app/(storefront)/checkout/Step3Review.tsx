'use client'

import { useCart } from '@/app/contexts/CartContext'

export default function Step3Confirm({
  back,
  address,
  payment
}: {
  back: () => void
  address: any
  payment: string
}) {
  const { cart, totalPrice, clearCart } = useCart()

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Xác nhận đơn hàng</h3>

      {/* ADDRESS */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border">
        <p>
          <b>Họ tên:</b> {address.name}
        </p>
        <p>
          <b>SĐT:</b> {address.phone}
        </p>
        <p>
          <b>Địa chỉ:</b> {address.address}
        </p>
        <p>
          <b>Thanh toán:</b> {payment.toUpperCase()}
        </p>
      </div>

      {/* ITEMS */}
      <div className="space-y-3">
        {cart.map((i) => (
          <div key={i._id} className="flex justify-between">
            <span>
              {i.name} × {i.quantity}
            </span>
            <b>{(i.price * i.quantity).toLocaleString('vi-VN')}₫</b>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6 text-lg font-bold">
        <span>Tổng cộng:</span>
        <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={back} className="px-6 py-3 border rounded-xl">
          Quay lại
        </button>

        <button
          onClick={() => {
            clearCart()
            alert('Đặt hàng thành công!')
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold"
        >
          Xác nhận đặt hàng
        </button>
      </div>
    </div>
  )
}

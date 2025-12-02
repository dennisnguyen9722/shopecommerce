'use client'

import { useCart } from '@/app/contexts/CartContext'
import serverApi from '@/src/lib/serverApi'
import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Step3Props {
  back: () => void
  address: {
    name: string
    email: string // ✅ THÊM EMAIL
    phone: string
    address: string
  }
  payment: string
}

export default function Step3Confirm({ back, address, payment }: Step3Props) {
  const { cart, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)

  const placeOrder = async () => {
    setLoading(true)
    try {
      const payload = {
        customerName: address.name,
        customerEmail: address.email, // ✅ GỬI EMAIL
        customerPhone: address.phone,
        customerAddress: address.address,
        paymentMethod: payment,
        totalPrice,
        items: cart.map((i) => ({
          productId: i._id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
          slug: i.slug
        }))
      }

      const { data } = await serverApi.post('/public/orders', payload)

      clearCart()
      window.location.href = '/orders/' + data._id
    } catch (err) {
      console.error(err)
      alert('Không thể đặt hàng!')
    } finally {
      setLoading(false)
    }
  }

  const paymentLabels: Record<string, string> = {
    cod: 'Tiền mặt (COD)',
    bank: 'Chuyển khoản ngân hàng',
    momo: 'Ví MoMo'
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Xác nhận đơn hàng</h2>

      {/* Thông tin khách hàng */}
      <div className="p-5 bg-gray-50 rounded-xl space-y-3 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">
          Thông tin giao hàng
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="w-32 text-gray-600">Họ tên:</span>
            <span className="font-medium">{address.name}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-600">Email:</span>
            <span className="font-medium">{address.email}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-600">SĐT:</span>
            <span className="font-medium">{address.phone}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-600">Địa chỉ:</span>
            <span className="font-medium flex-1">{address.address}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-600">Thanh toán:</span>
            <span className="font-medium">
              {paymentLabels[payment] || payment}
            </span>
          </div>
        </div>
      </div>

      {/* Sản phẩm */}
      <div className="border rounded-xl overflow-hidden mb-6">
        <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-700 border-b">
          Sản phẩm đã đặt
        </div>
        <div className="p-4 space-y-3">
          {cart.map((i) => (
            <div
              key={i._id}
              className="flex justify-between items-center text-sm"
            >
              <div className="flex-1">
                <span className="font-medium">{i.name}</span>
                <span className="text-gray-500 ml-2">× {i.quantity}</span>
              </div>
              <span className="font-semibold">
                {(i.price * i.quantity).toLocaleString('vi-VN')}₫
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tổng tiền */}
      <div className="bg-orange-50 p-5 rounded-xl">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">
            Tổng thanh toán:
          </span>
          <span className="text-2xl font-bold text-orange-600">
            {totalPrice.toLocaleString('vi-VN')}₫
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          ✉️ Hóa đơn sẽ được gửi đến email: <strong>{address.email}</strong>
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-8 gap-4">
        <button
          onClick={back}
          disabled={loading}
          className="flex-1 px-5 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Quay lại
        </button>

        <button
          onClick={placeOrder}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            'Xác nhận đặt hàng'
          )}
        </button>
      </div>
    </div>
  )
}

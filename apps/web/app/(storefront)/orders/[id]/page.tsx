// app/orders/[id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import serverApi from '@/src/lib/serverApi'
import Image from 'next/image'

type OrderItem = {
  productId: string
  name: string
  quantity: number
  price: number
  image?: string
  slug?: string
}

type Order = {
  _id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  paymentMethod: string
  items: OrderItem[]
  totalPrice: number
  status: string
  createdAt: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      router.replace('/')
      return
    }
    serverApi
      .get(`/public/orders/${orderId}`)
      .then((res) => setOrder(res.data))
      .catch(() => alert('Không tìm thấy đơn hàng'))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) return <div className="p-6 text-center">Đang tải...</div>
  if (!order)
    return <div className="p-6 text-center">Không tìm thấy đơn hàng.</div>

  return (
    <div className="container mx-auto px-4 max-w-4xl py-10">
      <h1 className="text-2xl font-bold mb-6">
        Chi tiết đơn hàng #{order._id}
      </h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <p>
          <strong>Họ tên:</strong> {order.customerName}
        </p>
        <p>
          <strong>SĐT:</strong> {order.customerPhone}
        </p>
        <p>
          <strong>Địa chỉ:</strong> {order.customerAddress}
        </p>
        <p>
          <strong>Thanh toán:</strong> {order.paymentMethod}
        </p>
        <p>
          <strong>Trạng thái:</strong> {order.status}
        </p>
      </div>

      <div className="space-y-4">
        {order.items.map((i) => (
          <div
            key={i.productId}
            className="flex gap-4 items-center p-3 border rounded-xl"
          >
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={i.image || ''}
                alt={i.name}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{i.name}</p>
              <p className="text-sm text-gray-500">Số lượng: {i.quantity}</p>
            </div>
            <div className="text-right font-bold text-orange-600">
              {(i.price * i.quantity).toLocaleString('vi-VN')}₫
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-8 text-lg font-bold">
        <span>Tổng thanh toán:</span>
        <span className="ml-2">
          {order.totalPrice.toLocaleString('vi-VN')}₫
        </span>
      </div>
    </div>
  )
}

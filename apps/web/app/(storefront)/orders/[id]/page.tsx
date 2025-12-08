// app/orders/[id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import serverApi from '@/src/lib/serverApi'
import Image from 'next/image'
import {
  Package,
  Truck,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Download
} from 'lucide-react'
import dynamic from 'next/dynamic'

// 🔥 Dùng lại component InvoicePDF từ admin
const InvoicePDFClient = dynamic(
  () => import('@/src/components/admin/InvoicePDF.client'),
  { ssr: false }
)

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
  }, [orderId, router])

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        pending: {
          bg: 'bg-yellow-100!',
          text: 'text-yellow-700!',
          label: 'Chờ xử lý'
        },
        confirmed: {
          bg: 'bg-blue-100!',
          text: 'text-blue-700!',
          label: 'Đã xác nhận'
        },
        processing: {
          bg: 'bg-blue-100!',
          text: 'text-blue-700!',
          label: 'Đang xử lý'
        },
        shipping: {
          bg: 'bg-purple-100!',
          text: 'text-purple-700!',
          label: 'Đang giao'
        },
        shipped: {
          bg: 'bg-purple-100!',
          text: 'text-purple-700!',
          label: 'Đang giao'
        },
        completed: {
          bg: 'bg-green-100!',
          text: 'text-green-700!',
          label: 'Hoàn thành'
        },
        cancelled: { bg: 'bg-red-100!', text: 'text-red-700!', label: 'Đã hủy' }
      }
    const badge = badges[status] || badges.pending
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    )
  }

  if (loading)
    return (
      <div className="min-h-screen bg-white! flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500! border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500! font-medium">Đang tải đơn hàng...</p>
        </div>
      </div>
    )

  if (!order)
    return (
      <div className="min-h-screen bg-white! flex items-center justify-center">
        <div className="text-center">
          <Package className="w-20 h-20 text-gray-300! mx-auto mb-4" />
          <p className="text-gray-500! text-lg mb-2">Không tìm thấy đơn hàng</p>
          <button
            onClick={() => router.push('/')}
            className="text-orange-600! hover:text-orange-700! font-semibold"
          >
            ← Quay về trang chủ
          </button>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50! to-white! py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-600! hover:text-gray-900! font-medium mb-4 flex items-center gap-2"
          >
            ← Quay lại
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900! mb-2">
                Chi tiết đơn hàng
              </h1>
              <p className="text-gray-500! font-mono text-sm">
                Mã đơn: #{order._id.slice(-8).toUpperCase()}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="bg-white! rounded-2xl p-6 shadow-lg border border-gray-100! mb-6">
          <h2 className="text-lg font-bold text-gray-900! mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-600!" />
            Thông tin giao hàng
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100! flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-blue-600!" />
              </div>
              <div>
                <p className="text-sm text-gray-500! mb-1">Người nhận</p>
                <p className="font-semibold text-gray-900!">
                  {order.customerName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100! flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-green-600!" />
              </div>
              <div>
                <p className="text-sm text-gray-500! mb-1">Số điện thoại</p>
                <p className="font-semibold text-gray-900!">
                  {order.customerPhone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 md:col-span-2">
              <div className="w-10 h-10 rounded-full bg-purple-100! flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-purple-600!" />
              </div>
              <div>
                <p className="text-sm text-gray-500! mb-1">Địa chỉ giao hàng</p>
                <p className="font-semibold text-gray-900!">
                  {order.customerAddress}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100! flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-orange-600!" />
              </div>
              <div>
                <p className="text-sm text-gray-500! mb-1">
                  Phương thức thanh toán
                </p>
                <p className="font-semibold text-gray-900!">
                  {order.paymentMethod}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100! flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-gray-600!" />
              </div>
              <div>
                <p className="text-sm text-gray-500! mb-1">Ngày đặt hàng</p>
                <p className="font-semibold text-gray-900!">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white! rounded-2xl p-6 shadow-lg border border-gray-100! mb-6">
          <h2 className="text-lg font-bold text-gray-900! mb-4">
            Sản phẩm ({order.items.length})
          </h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="flex gap-4 items-center p-4 border border-gray-100! rounded-xl hover:bg-gray-50! transition-colors"
              >
                <div className="relative w-20 h-20 flex-shrink-0 bg-white! rounded-lg overflow-hidden border border-gray-100!">
                  <Image
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900! mb-1 line-clamp-2">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500!">
                    <span>SL: {item.quantity}</span>
                    <span>×</span>
                    <span className="text-gray-700! font-medium">
                      {item.price.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600!">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-br from-orange-50! to-red-50! rounded-2xl p-6 border-2 border-orange-200! shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600! font-medium">Tạm tính:</span>
            <span className="text-gray-900! font-semibold">
              {order.totalPrice.toLocaleString('vi-VN')}₫
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600! font-medium">Phí vận chuyển:</span>
            <span className="text-green-600! font-semibold">Miễn phí</span>
          </div>
          <div className="border-t border-orange-200! pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900!">
                Tổng thanh toán:
              </span>
              <span className="text-3xl font-bold text-orange-600!">
                {order.totalPrice.toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-gray-900! text-white! font-semibold rounded-xl hover:bg-black! hover:shadow-lg transition-all"
          >
            Tiếp tục mua sắm
          </button>

          {/* 🔥 DÙNG COMPONENT InvoicePDFClient - wrapper sẽ full width */}
          <InvoicePDFClient order={order} variant="customer" />
        </div>
      </div>
    </div>
  )
}

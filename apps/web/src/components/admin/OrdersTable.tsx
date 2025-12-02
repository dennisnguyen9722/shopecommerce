'use client'

import { useState } from 'react'
import OrderDetailDialog from './OrderDetailDialog'

export type OrderItem = {
  productId: string
  name: string
  quantity: number
  price: number
  image?: string
  slug?: string
}

export type OrderType = {
  _id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  paymentMethod?: string
  items: OrderItem[]
  totalPrice: number
  status: string
  createdAt: string
}

interface OrdersTableProps {
  orders?: OrderType[] | null
  isLoading?: boolean
}

// OrdersTable.tsx
// OrdersTable.tsx
export default function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const list: OrderType[] = Array.isArray(orders) ? orders : []

  console.log('🎨 Rendering OrdersTable:', {
    orders,
    list,
    listLength: list.length,
    isLoading
  })

  return (
    <div className="space-y-4">
      <OrderDetailDialog
        orderId={selectedId}
        onClose={() => setSelectedId(null)}
      />

      {/* LOADING */}
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">
          Đang tải đơn hàng...
        </div>
      ) : null}

      {/* EMPTY */}
      {!isLoading && list.length === 0 ? (
        <div className="p-6 text-center text-gray-500 bg-white rounded-xl border">
          Chưa có đơn hàng nào.
        </div>
      ) : null}

      {/* LIST ORDERS */}
      {!isLoading &&
        list.length > 0 &&
        list.map((o: OrderType) => {
          console.log('📦 Rendering order:', o._id, o)

          return (
            <div
              key={o._id}
              onClick={() => setSelectedId(o._id)}
              className="p-4 rounded-xl border bg-white shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{o.customerName || 'N/A'}</h3>
                  <p className="text-sm text-gray-500">
                    {o.customerPhone || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {o.customerAddress || 'N/A'}
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-bold text-orange-600">
                    {o.totalPrice?.toLocaleString('vi-VN') || '0'}₫
                  </div>

                  <div className="text-xs text-gray-500">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleString('vi-VN')
                      : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="text-sm mt-2 text-gray-600">
                Có {o.items?.length ?? 0} sản phẩm
              </div>

              <div className="mt-1 text-xs text-gray-500">
                Trạng thái: {o.status || 'pending'}
              </div>
            </div>
          )
        })}
    </div>
  )
}

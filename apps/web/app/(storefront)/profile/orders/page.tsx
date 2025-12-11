'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import serverApi from '@/src/lib/api'
import Link from 'next/link'
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const formatCurrency = (n: number) => n?.toLocaleString('vi-VN') + ' ₫'

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Chờ xử lý',
        color: 'bg-yellow-100 text-yellow-700',
        icon: Clock
      }
    case 'processing':
      return {
        label: 'Đang xử lý',
        color: 'bg-blue-100 text-blue-700',
        icon: Package
      }
    case 'shipped':
      return {
        label: 'Đang giao',
        color: 'bg-purple-100 text-purple-700',
        icon: Truck
      }
    case 'completed':
      return {
        label: 'Hoàn thành',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle2
      }
    case 'cancelled':
      return {
        label: 'Đã hủy',
        color: 'bg-red-100 text-red-700',
        icon: XCircle
      }
    default:
      return {
        label: status,
        color: 'bg-gray-100 text-gray-700',
        icon: Package
      }
  }
}

const ITEMS_PER_PAGE = 10

export default function MyOrdersPage() {
  const [currentPage, setCurrentPage] = useState(1)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await serverApi.get('/public/orders')
      return res.data
    }
  })

  // Tính toán phân trang
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentOrders = orders.slice(startIndex, endIndex)

  // Reset về trang 1 khi orders thay đổi
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    )

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center max-w-md mx-auto">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Chưa có đơn hàng
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Bạn chưa có đơn hàng nào. Khám phá sản phẩm ngay!
        </p>
        <Link href="/products">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            Mua sắm ngay
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Đơn hàng của tôi</h2>
        <span className="text-sm text-gray-500">Tổng: {orders.length} đơn</span>
      </div>

      <div className="grid gap-2">
        {currentOrders.map((order: any) => {
          const status = getStatusInfo(order.status)
          const StatusIcon = status.icon

          return (
            <div
              key={order._id}
              className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded border border-gray-200 flex-shrink-0 overflow-hidden">
                  {order.items?.[0]?.image ? (
                    <img
                      src={order.items[0].image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={14} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-gray-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <Badge
                      className={`${status.color} border-0 text-xs px-1.5 py-0 h-5 flex items-center gap-1`}
                    >
                      <StatusIcon size={10} /> {status.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>
                      {format(new Date(order.createdAt), 'dd/MM/yyyy', {
                        locale: vi
                      })}
                    </span>
                    <span>•</span>
                    <span>{order.items?.length || 0} SP</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-bold text-orange-600 whitespace-nowrap">
                      {formatCurrency(order.totalPrice)}
                    </div>
                  </div>
                  <Link href={`/profile/orders/${order._id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7 px-2 text-xs"
                    >
                      Xem
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft size={16} />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Hiển thị trang đầu, cuối và các trang gần current page
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`h-8 w-8 p-0 ${
                      currentPage === page
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </Button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-1 text-gray-400">
                    ...
                  </span>
                )
              }
              return null
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Page Info */}
      {totalPages > 1 && (
        <div className="text-center text-xs text-gray-500">
          Trang {currentPage} / {totalPages}
        </div>
      )}
    </div>
  )
}

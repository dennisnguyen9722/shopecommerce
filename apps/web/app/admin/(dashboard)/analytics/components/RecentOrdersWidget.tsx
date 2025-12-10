'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAdminAuthStore } from '@/src/store/adminAuthStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const statusConfig = {
  pending: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-800' },
  processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
}

export default function RecentOrdersWidget() {
  const token = useAdminAuthStore((s) => s.token)

  const { data: orders, isLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_URL}/analytics/recent-orders?limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    refetchInterval: 10000,
    enabled: !!token
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Chưa có đơn hàng nào
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order: any) => {
        const status =
          statusConfig[order.status as keyof typeof statusConfig] ||
          statusConfig.pending

        return (
          <div
            key={order._id}
            className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground">
                  {order.orderNumber}
                </h4>
                <Badge className={status.color}>{status.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {order.customerName} • {order.customerPhone}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(order.createdAt), {
                  addSuffix: true,
                  locale: vi
                })}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-foreground">
                {formatCurrency(order.totalPrice)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

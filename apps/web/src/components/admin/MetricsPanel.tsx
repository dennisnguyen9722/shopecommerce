'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react'

const fetchMetrics = async () => {
  const { data } = await api.get('/admin/metrics')
  return data
}

export default function MetricsPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics
  })

  // Lưu ý: Tôi đã bỏ các class bg-color-50 cứng và thay bằng border-l-4 để tạo điểm nhấn màu
  const metrics = [
    {
      title: 'Doanh thu (30 ngày)',
      value: data?.revenue ?? 0,
      format: 'currency',
      icon: DollarSign,
      colorClass: 'border-green-500 text-green-600 dark:text-green-400',
      iconBg:
        'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
    },
    {
      title: 'Đơn hàng',
      value: data?.orders ?? 0,
      format: 'number',
      icon: ShoppingCart,
      colorClass: 'border-blue-500 text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Khách hàng mới',
      value: data?.newCustomers ?? 0,
      format: 'number',
      icon: Users,
      colorClass: 'border-purple-500 text-purple-600 dark:text-purple-400',
      iconBg:
        'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Tổng đơn',
      value: data?.totalOrders ?? 0,
      format: 'number',
      icon: TrendingUp,
      colorClass: 'border-orange-500 text-orange-600 dark:text-orange-400',
      iconBg:
        'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
    }
  ]

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-center border border-destructive/20">
        Lỗi khi tải dữ liệu 😢
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <div
            key={index}
            // 👇 SỬA MÀU NỀN CARD: bg-card, border-border
            className={`
              relative overflow-hidden rounded-xl p-5 border border-border shadow-sm
              bg-card text-card-foreground hover:shadow-md transition-all duration-300
            `}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${metric.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">
                {metric.title}
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div
                  className={`text-2xl font-bold ${
                    metric.colorClass.split(' ')[1]
                  }`}
                >
                  {metric.format === 'currency'
                    ? `${metric.value.toLocaleString('vi-VN')} ₫`
                    : metric.value.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

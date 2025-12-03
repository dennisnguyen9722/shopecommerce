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

  const metrics = [
    {
      title: 'Doanh thu (30 ngày)',
      value: data?.revenue ?? 0,
      format: 'currency',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Đơn hàng',
      value: data?.orders ?? 0,
      format: 'number',
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Khách hàng mới',
      value: data?.newCustomers ?? 0,
      format: 'number',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Tổng đơn',
      value: data?.totalOrders ?? 0,
      format: 'number',
      icon: TrendingUp,
      color: 'from-orange-500 to-yellow-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      textColor: 'text-orange-600 dark:text-orange-400'
    }
  ]

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 text-center">
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
            className={`${metric.bgColor} rounded-xl p-5 border border-gray-100 dark:border-gray-800 hover:scale-105 transition-transform duration-300 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`p-2.5 rounded-lg bg-gradient-to-br ${metric.color}`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className={`text-2xl font-bold ${metric.textColor}`}>
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

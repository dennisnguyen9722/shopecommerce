'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'
import GlassCard from '@/src/components/admin/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react'

const fetchMetrics = async () => {
  const { data } = await api.get('/admin/metrics')
  return data
}

export default function MetricsPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache (replaces cacheTime in v5)
    refetchOnMount: true,
    refetchOnWindowFocus: true
  })

  const metrics = [
    {
      title: 'Doanh thu (30 ngày)',
      value: data?.revenue ?? 0,
      format: 'currency',
      icon: DollarSign,
      gradientFrom: 'from-green-500/20',
      gradientTo: 'to-emerald-500/20',
      iconColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Đơn hàng',
      value: data?.orders ?? 0,
      format: 'number',
      icon: ShoppingCart,
      gradientFrom: 'from-blue-500/20',
      gradientTo: 'to-cyan-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Khách hàng mới',
      value: data?.newCustomers ?? 0,
      format: 'number',
      icon: Users,
      gradientFrom: 'from-purple-500/20',
      gradientTo: 'to-pink-500/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Tổng đơn',
      value: data?.totalOrders ?? 0,
      format: 'number',
      icon: TrendingUp,
      gradientFrom: 'from-orange-500/20',
      gradientTo: 'to-red-500/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      valueColor: 'text-orange-600 dark:text-orange-400'
    }
  ]

  if (error) {
    return (
      <GlassCard className="p-6 bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-900/20 dark:to-red-800/10">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="font-semibold">Lỗi khi tải dữ liệu 😢</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <GlassCard
            key={index}
            className="p-5 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30 hover:from-white/60 hover:to-white/40 dark:hover:from-gray-800/60 dark:hover:to-gray-900/40 transition-all duration-200 border border-white/40 dark:border-gray-700/40"
          >
            <div className="space-y-3">
              {/* Icon */}
              <div
                className={`p-2.5 rounded-lg bg-gradient-to-br ${metric.gradientFrom} ${metric.gradientTo} w-fit shadow-sm`}
              >
                <Icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>

              {/* Title */}
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </div>

              {/* Value */}
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className={`text-2xl font-bold ${metric.valueColor}`}>
                  {metric.format === 'currency'
                    ? `${metric.value.toLocaleString('vi-VN')} ₫`
                    : metric.value.toLocaleString()}
                </div>
              )}
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}

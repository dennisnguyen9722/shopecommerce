'use client'

import { useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, AlertTriangle, XCircle, Boxes, Sparkles } from 'lucide-react'
import GlassCard from '@/src/components/admin/GlassCard'

interface InventoryOverview {
  totalProducts: number
  lowStock: number
  outOfStock: number
  totalVariants: number
}

async function fetchInventoryOverview(): Promise<InventoryOverview> {
  const res = await api.get('/admin/analytics/inventory-overview')
  return res.data
}

export default function InventoryOverviewWidget() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['inventory-overview'],
    queryFn: fetchInventoryOverview
  })

  useEffect(() => {
    const timer = setInterval(() => refetch(), 10000)
    return () => clearInterval(timer)
  }, [refetch])

  const stats = [
    {
      title: 'Tổng sản phẩm',
      value: data?.totalProducts ?? 0,
      icon: Package,
      gradientFrom: 'from-blue-500/20',
      gradientTo: 'to-cyan-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Số biến thể',
      value: data?.totalVariants ?? 0,
      icon: Boxes,
      gradientFrom: 'from-purple-500/20',
      gradientTo: 'to-pink-500/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Sắp hết hàng',
      value: data?.lowStock ?? 0,
      icon: AlertTriangle,
      gradientFrom: 'from-orange-500/20',
      gradientTo: 'to-amber-500/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      valueColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Hết hàng',
      value: data?.outOfStock ?? 0,
      icon: XCircle,
      gradientFrom: 'from-red-500/20',
      gradientTo: 'to-rose-500/20',
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-600 dark:text-red-400'
    }
  ]

  return (
    <GlassCard className="h-full">
      {/* Header */}
      <div className="pb-4 mb-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Tổng quan tồn kho
              </h3>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
              Trạng thái hàng hóa thời gian thực
            </p>
          </div>

          <Link href="/admin/products?tab=inventory">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/40 dark:border-gray-700/40 hover:bg-white/70 dark:hover:bg-gray-800/70"
            >
              Xem chi tiết
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <GlassCard
              key={index}
              className="p-4 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30 hover:from-white/60 hover:to-white/40 dark:hover:from-gray-800/60 dark:hover:to-gray-900/40 transition-all duration-200 border border-white/40 dark:border-gray-700/40"
            >
              <div className="space-y-3">
                {/* Icon */}
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradientFrom} ${stat.gradientTo} w-fit shadow-sm`}
                >
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>

                {/* Title */}
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </div>

                {/* Value */}
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className={`text-2xl font-bold ${stat.valueColor}`}>
                    {stat.value.toLocaleString()}
                  </div>
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>
    </GlassCard>
  )
}

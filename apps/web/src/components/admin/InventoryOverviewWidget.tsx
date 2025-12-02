'use client'

import { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, AlertTriangle, XCircle, Boxes } from 'lucide-react'

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
    const timer = setInterval(() => {
      refetch()
    }, 10000)

    return () => clearInterval(timer)
  }, [refetch])

  const stats = [
    {
      title: 'Tổng sản phẩm',
      value: data?.totalProducts ?? 0,
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Số biến thể',
      value: data?.totalVariants ?? 0,
      icon: Boxes,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Sắp hết hàng',
      value: data?.lowStock ?? 0,
      icon: AlertTriangle,
      color: 'from-orange-500 to-yellow-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      textColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Hết hàng',
      value: data?.outOfStock ?? 0,
      icon: XCircle,
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      textColor: 'text-red-600 dark:text-red-400'
    }
  ]

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-600" />
            Tổng quan tồn kho
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Theo dõi trạng thái hàng tồn kho theo thời gian thực
          </p>
        </div>

        <Link href="/admin/inventory">
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all"
          >
            Xem chi tiết →
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:scale-105 transition-transform duration-300`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

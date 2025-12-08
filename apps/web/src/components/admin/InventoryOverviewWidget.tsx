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
    const timer = setInterval(() => refetch(), 10000)
    return () => clearInterval(timer)
  }, [refetch])

  const stats = [
    {
      title: 'Tổng sản phẩm',
      value: data?.totalProducts ?? 0,
      icon: Package,
      iconClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Số biến thể',
      value: data?.totalVariants ?? 0,
      icon: Boxes,
      iconClass: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Sắp hết hàng',
      value: data?.lowStock ?? 0,
      icon: AlertTriangle,
      iconClass: 'text-orange-600 dark:text-orange-400',
      bgClass: 'bg-orange-100 dark:bg-orange-900/30'
    },
    {
      title: 'Hết hàng',
      value: data?.outOfStock ?? 0,
      icon: XCircle,
      iconClass: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-100 dark:bg-red-900/30'
    }
  ]

  return (
    // 👇 SỬA CARD: Dùng bg-card chuẩn
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Package className="w-6 h-6 text-primary" />
            Tổng quan tồn kho
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Trạng thái hàng hóa thời gian thực
          </p>
        </div>

        <Link href="/admin/products?tab=inventory">
          <Button variant="outline" size="sm">
            Xem chi tiết
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`
                rounded-xl p-4 border border-border transition-all
                hover:shadow-md bg-background/50
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgClass}`}>
                  <Icon className={`w-5 h-5 ${stat.iconClass}`} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">
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

'use client'

import { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

  // 🔄 AUTO REFRESH mỗi 10 giây
  useEffect(() => {
    const timer = setInterval(() => {
      refetch()
    }, 10000)

    return () => clearInterval(timer)
  }, [refetch])

  return (
    <Card className="border">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>📦 Tổng quan tồn kho</CardTitle>

        {/* ⭐ Link đến trang tồn kho */}
        <Link href="/admin/inventory">
          <Button variant="outline" size="sm">
            Xem tất cả tồn kho →
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tổng sản phẩm */}
        <div className="space-y-1">
          <div className="text-sm text-gray-500">Tổng sản phẩm</div>
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <div className="text-xl font-bold">{data?.totalProducts ?? 0}</div>
          )}
        </div>

        {/* Tổng biến thể */}
        <div className="space-y-1">
          <div className="text-sm text-gray-500">Số biến thể</div>
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <div className="text-xl font-bold">{data?.totalVariants ?? 0}</div>
          )}
        </div>

        {/* Sắp hết hàng (< 5) */}
        <div className="space-y-1">
          <div className="text-sm text-gray-500">Sắp hết hàng (&lt; 5)</div>
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <div className="text-xl font-bold text-orange-600">
              {data?.lowStock ?? 0}
            </div>
          )}
        </div>

        {/* Hết hàng */}
        <div className="space-y-1">
          <div className="text-sm text-gray-500">Hết hàng</div>
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <div className="text-xl font-bold text-red-600">
              {data?.outOfStock ?? 0}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

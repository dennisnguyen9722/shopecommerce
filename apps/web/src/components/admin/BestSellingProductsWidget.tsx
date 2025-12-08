'use client'

import { useEffect, useState } from 'react'
import api from '@/src/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, Package } from 'lucide-react'
import Image from 'next/image'

export default function BestSellingProductsWidget() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  const fetchData = async () => {
    try {
      const { data } = await api.get('/admin/analytics/best-products', {
        params: { limit: 5, days: 30 }
      })
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="border-border shadow-sm bg-card h-full">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <TrendingUp className="w-6 h-6 text-green-500" />
            Sản phẩm bán chạy
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Top 5 trong 30 ngày qua
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-border"
              >
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Chưa có dữ liệu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((p: any, index: number) => (
              <div
                key={`${p.productId}-${index}`}
                className="flex items-center gap-4 p-3 rounded-xl border border-border bg-background/50 hover:bg-accent/50 transition-colors"
              >
                {/* Rank */}
                <div
                  className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                  ${
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                      ? 'bg-gray-400'
                      : index === 2
                      ? 'bg-orange-400'
                      : 'bg-muted text-muted-foreground'
                  }
                `}
                >
                  {index + 1}
                </div>

                {/* Image */}
                <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package size={16} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {p.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>
                      Đã bán: <b className="text-primary">{p.quantitySold}</b>
                    </span>
                    <span>•</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {p.revenue.toLocaleString()}₫
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

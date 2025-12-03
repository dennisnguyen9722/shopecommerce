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
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Sản phẩm bán chạy
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Top 5 trong 30 ngày qua
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <Skeleton className="h-14 w-14 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Chưa có dữ liệu bán hàng</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((p: any, index: number) => (
              <div
                key={`${p.productId}-${index}`}
                className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md hover:scale-[1.02] transition-all duration-300"
              >
                {/* Rank Badge */}
                <div
                  className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                      : ''
                  }
                  ${
                    index === 1
                      ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                      : ''
                  }
                  ${
                    index === 2
                      ? 'bg-gradient-to-br from-orange-300 to-amber-500 text-white'
                      : ''
                  }
                  ${
                    index > 2
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      : ''
                  }
                `}
                >
                  {index + 1}
                </div>

                {/* Product Image */}
                <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {p.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Đã bán:{' '}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {p.quantitySold}
                      </span>
                    </span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">
                      •
                    </span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                      {p.revenue.toLocaleString()}₫
                    </span>
                  </div>
                </div>

                {/* Trend Icon */}
                <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

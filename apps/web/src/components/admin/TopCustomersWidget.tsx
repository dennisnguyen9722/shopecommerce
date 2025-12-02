'use client'

import { useEffect, useState } from 'react'
import api from '@/src/lib/api'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Crown, Mail, DollarSign, Users } from 'lucide-react'

export default function TopCustomersWidget() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  const fetchData = async () => {
    try {
      const { data } = await api.get('/admin/analytics/top-customers', {
        params: { limit: 5 }
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
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            Khách hàng VIP
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Top 5 khách hàng có giá trị cao nhất (CLV)
          </p>
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
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Chưa có dữ liệu khách hàng</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((c: any, index: number) => (
              <div
                key={c._id}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md hover:scale-[1.02] transition-all duration-300"
              >
                {/* Avatar with Rank */}
                <div className="relative">
                  <div
                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                    ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                        : ''
                    }
                    ${
                      index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                        : ''
                    }
                    ${
                      index === 2
                        ? 'bg-gradient-to-br from-orange-300 to-amber-500'
                        : ''
                    }
                    ${
                      index > 2
                        ? 'bg-gradient-to-br from-purple-400 to-pink-500'
                        : ''
                    }
                  `}
                  >
                    <span className="text-white text-sm font-bold">
                      {c.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>

                  {/* Crown for #1 */}
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-yellow-900" />
                    </div>
                  )}
                </div>

                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {c.name || 'Khách hàng'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {c.email}
                    </span>
                  </div>
                </div>

                {/* Total Spent */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-bold text-sm">
                      {(c.totalSpent / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Tổng chi
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

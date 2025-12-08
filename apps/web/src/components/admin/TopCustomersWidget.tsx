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
    <Card className="border-border shadow-sm bg-card h-full">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Crown className="w-6 h-6 text-yellow-500" />
            Khách hàng VIP
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Top 5 khách hàng chi tiêu cao nhất
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 border border-border rounded-lg"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Chưa có dữ liệu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((c: any, index: number) => (
              <div
                key={c._id}
                className="flex items-center gap-4 p-3 rounded-xl border border-border bg-background/50 hover:bg-accent/50 transition-colors"
              >
                {/* Avatar */}
                <div className="relative">
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm
                    ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                        : 'bg-primary'
                    }
                  `}
                  >
                    {c.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center border border-card">
                      <Crown className="w-2 h-2 text-yellow-900" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {c.name || 'Khách hàng'}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{c.email}</span>
                  </div>
                </div>

                {/* Money */}
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600 dark:text-green-400">
                    {(c.totalSpent / 1000).toFixed(0)}K
                  </div>
                  <span className="text-[10px] text-muted-foreground">
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

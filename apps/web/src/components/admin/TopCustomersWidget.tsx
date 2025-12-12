'use client'

import { useEffect, useState } from 'react'
import api from '@/src/lib/api'
import GlassCard from '@/src/components/admin/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Crown, Mail, Users, Sparkles } from 'lucide-react'

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
    <GlassCard className="h-full">
      {/* Header */}
      <div className="pb-4 mb-4 border-b border-white/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Khách hàng VIP
          </h3>
          <Sparkles className="w-4 h-4 text-yellow-500 ml-auto" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
          Top 5 khách hàng chi tiêu cao nhất
        </p>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <GlassCard
                key={i}
                className="p-3 bg-gradient-to-br from-white/40 to-white/20 dark:from-gray-800/40 dark:to-gray-900/20"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : items.length === 0 ? (
          <GlassCard className="py-12 text-center bg-gradient-to-br from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-900/20">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
          </GlassCard>
        ) : (
          <div className="space-y-2.5">
            {items.map((c: any, index: number) => (
              <GlassCard
                key={c._id}
                className="p-3 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30 hover:from-white/60 hover:to-white/40 dark:hover:from-gray-800/60 dark:hover:to-gray-900/40 transition-all duration-200 border border-white/40 dark:border-gray-700/40"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-lg
                        ${
                          index === 0
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-2 ring-yellow-200/50'
                            : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 ring-2 ring-gray-200/50'
                            : index === 2
                            ? 'bg-gradient-to-br from-orange-400 to-orange-600 ring-2 ring-orange-200/50'
                            : 'bg-gradient-to-br from-blue-400 to-blue-600'
                        }
                      `}
                    >
                      {c.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
                        <Crown className="w-2 h-2 text-yellow-900" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {c.name || 'Khách hàng'}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  </div>

                  {/* Money */}
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      {(c.totalSpent / 1000).toFixed(0)}K
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      Tổng chi
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  )
}

'use client'

import { useEffect, useState } from 'react'
import api from '@/src/lib/api'
import GlassCard from '@/src/components/admin/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Package, ShoppingCart, Sparkles } from 'lucide-react'
import Image from 'next/image'

export default function BestSellingProductsWidget() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  const fetchData = async () => {
    try {
      const { data } = await api.get('/admin/analytics/best-products', {
        params: { limit: 5, days: 30 }
      })
      console.log('📊 [Best Products] Data received:', data) // 🔥 Debug log
      setItems(data)
    } catch (err) {
      console.error('❌ [Best Products] Error:', err)
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
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Sản phẩm bán chạy
          </h3>
          <Sparkles className="w-4 h-4 text-yellow-500 ml-auto" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
          Top 5 trong 30 ngày qua
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
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : items.length === 0 ? (
          <GlassCard className="py-12 text-center bg-gradient-to-br from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-900/20">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
          </GlassCard>
        ) : (
          <div className="space-y-2.5">
            {items.map((p: any, index: number) => (
              <GlassCard
                key={`${p.productId}-${index}`}
                className="p-3 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30 hover:from-white/60 hover:to-white/40 dark:hover:from-gray-800/60 dark:hover:to-gray-900/40 transition-all duration-200 border border-white/40 dark:border-gray-700/40"
              >
                <div className="flex items-start gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 shadow-lg
                    ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 ring-2 ring-yellow-200/50'
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-400 to-gray-600 ring-2 ring-gray-200/50'
                        : index === 2
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 ring-2 ring-orange-200/50'
                        : 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700'
                    }
                  `}
                  >
                    {index + 1}
                  </div>

                  {/* Image */}
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden border-2 border-white/50 dark:border-gray-700/50 flex-shrink-0 bg-white/30 dark:bg-gray-800/30 shadow-sm">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package size={18} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Product Name */}
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1.5">
                      {p.name}
                    </h4>

                    {/* Variant Info */}
                    {p.variantInfo && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {p.variantInfo.color && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 bg-blue-100/80 text-blue-700 border-blue-300/50 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/50 backdrop-blur-sm"
                          >
                            {p.variantInfo.color}
                          </Badge>
                        )}
                        {p.variantInfo.size && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 bg-purple-100/80 text-purple-700 border-purple-300/50 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700/50 backdrop-blur-sm"
                          >
                            {p.variantInfo.size}
                          </Badge>
                        )}
                        {p.variantInfo.options &&
                          Object.entries(p.variantInfo.options).map(
                            ([key, value]: [string, any]) => {
                              if (
                                key === 'Màu sắc' ||
                                key === 'Color' ||
                                key === 'Kích thước' ||
                                key === 'Size'
                              )
                                return null
                              return (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 bg-gray-100/80 text-gray-700 border-gray-300/50 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-600/50 backdrop-blur-sm"
                                >
                                  {value}
                                </Badge>
                              )
                            }
                          )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex flex-col gap-1.5 text-xs">
                      {/* Quantity Sold - WITH FALLBACK */}
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded bg-primary/10">
                          <ShoppingCart className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Đã bán:
                        </span>
                        {p.quantitySold !== undefined &&
                        p.quantitySold !== null ? (
                          <span className="font-bold text-primary text-sm">
                            {p.quantitySold} sản phẩm
                          </span>
                        ) : (
                          <span className="text-xs text-red-500">
                            (Chưa có dữ liệu)
                          </span>
                        )}
                      </div>

                      {/* Revenue */}
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded bg-green-500/10">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 text-green-600 dark:text-green-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Doanh thu:
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {(p.revenue || 0).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>

                    {/* SKU */}
                    {p.sku && (
                      <div className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                        SKU: {p.sku}
                      </div>
                    )}
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

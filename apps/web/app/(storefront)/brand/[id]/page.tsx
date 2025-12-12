'use client'

import { use, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import serverApi from '@/src/lib/api'
import ProductCard from '@/app/(storefront)/components/productCard'
import {
  Package,
  SearchX,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Globe,
  Share2
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Component Loading xịn sò
const BrandSkeleton = () => (
  <div className="min-h-screen bg-gray-50 pb-12">
    <div className="h-48 bg-gray-200 animate-pulse" />
    <div className="container mx-auto px-4 -mt-16 relative z-10">
      <div className="flex flex-col md:flex-row gap-6 items-end md:items-center mb-8">
        <Skeleton className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg" />
        <div className="space-y-2 mb-2 flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default function BrandPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [sort, setSort] = useState('newest')

  // 1. Fetch thông tin Brand
  const { data: brand, isLoading: loadingBrand } = useQuery({
    queryKey: ['brand', id],
    queryFn: async () => {
      const res = await serverApi.get(`/public/brands/${id}`)
      return res.data
    },
    enabled: !!id
  })

  // 2. Fetch Sản phẩm
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['brand-products', id, sort],
    queryFn: async () => {
      const res = await serverApi.get('/public/products', {
        params: {
          brand: id,
          limit: 50,
          sort: sort
        }
      })
      return res.data
    },
    enabled: !!id
  })

  if (loadingBrand || loadingProducts) return <BrandSkeleton />

  if (!brand) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
          <SearchX className="w-12 h-12 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Không tìm thấy thương hiệu
        </h3>
        <p className="text-sm">
          Thương hiệu này có thể đã bị ẩn hoặc không tồn tại.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 1. HERO BANNER BACKGROUND */}
      <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        {/* Brand Name Big Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[10rem] font-black text-white/5 uppercase whitespace-nowrap tracking-tighter">
            {brand.name}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl pb-12">
        {/* 2. BRAND INFO CARD - Floating effect */}
        <div className="relative -mt-16 mb-10 z-10">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 md:items-center">
            {/* Logo Box */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 flex-shrink-0 -mt-16 md:mt-0 flex items-center justify-center overflow-hidden relative group">
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <span className="text-4xl font-bold text-gray-300">
                  {brand.name?.[0]}
                </span>
              )}
            </div>

            {/* Info Content */}
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  {brand.name}
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100">
                    <CheckCircle2
                      size={14}
                      className="fill-blue-600 text-white"
                    />
                    Official Store
                  </span>
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Globe size={16} />
                    </a>
                  )}
                </div>
              </div>

              {brand.description && (
                <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed">
                  {brand.description}
                </p>
              )}

              <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package size={18} className="text-orange-500" />
                  <span className="font-semibold text-gray-900">
                    {products.length}
                  </span>{' '}
                  sản phẩm
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">4.9/5</span>{' '}
                  Đánh giá
                </div>

                {/* Share Button */}
                <div className="ml-auto md:ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8 text-gray-600 border-gray-300 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50"
                  >
                    <Share2 size={14} /> Chia sẻ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TOOLBAR & PRODUCTS */}
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-orange-500" size={20} /> Danh sách sản
              phẩm
            </h2>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 mr-2">
                <Filter size={16} />
                <span className="hidden sm:inline">Sắp xếp:</span>
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200">
                  <SelectValue placeholder="Mới nhất" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                  <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Thương hiệu này chưa có sản phẩm
              </h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                Các sản phẩm mới nhất từ {brand.name} sẽ sớm được cập nhật. Vui
                lòng quay lại sau.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

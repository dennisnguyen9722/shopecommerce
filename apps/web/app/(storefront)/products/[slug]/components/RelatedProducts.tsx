'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import serverApi from '@/src/lib/serverApi' // Dùng luôn serverApi có sẵn của bạn
import ProductCard from '@/app/(storefront)/components/productCard'
import { Loader2 } from 'lucide-react'

interface RelatedProductsProps {
  categoryId: string
  currentProductId: string
}

const RelatedProducts = ({
  categoryId,
  currentProductId
}: RelatedProductsProps) => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['related-products', currentProductId],
    queryFn: async () => {
      // Gọi API mới tạo: /public/products/related
      const { data } = await serverApi.get('/public/products/related', {
        params: {
          categoryId,
          currentProductId,
          limit: 4
        }
      })
      return data
    },
    enabled: !!categoryId && !!currentProductId,
    staleTime: 5 * 60 * 1000 // Cache 5 phút
  })

  // Loading state (Skeleton đơn giản)
  if (isLoading) {
    return (
      <div className="mt-16 py-10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // Nếu không có sản phẩm nào thì ẩn luôn
  if (!products || products.length === 0) return null

  return (
    <section className="mt-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900! mb-2">
          Sản phẩm liên quan
        </h2>
        <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full mb-3"></div>
        <p className="text-gray-600!">
          Khám phá thêm các sản phẩm cùng danh mục
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default RelatedProducts

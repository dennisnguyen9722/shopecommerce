'use client'

import { useEffect, useState } from 'react'
import api from '@/src/lib/api'
import ProductCard from './productCard'
import QuickViewModal from './quickViewModal'

export default function FeaturedProducts({ items }: { items?: any[] }) {
  const [products, setProducts] = useState<any[]>(items || [])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!items) {
      api.get('/public/products/featured').then((res) => {
        setProducts(res.data || [])
      })
    }
  }, [items])

  const handleQuickView = (product: any) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedProduct(null), 300)
  }

  if (products.length === 0) return null

  return (
    <>
      <section className="w-full">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* TIÊU ĐỀ SECTION */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                🔥 Sản phẩm nổi bật
              </h2>
              <p className="text-gray-600 text-sm mt-1">Được yêu thích nhất</p>
            </div>

            <a
              href="/featured"
              className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 group"
            >
              Xem thêm
              <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a>
          </div>

          {/* DANH SÁCH SẢN PHẨM */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {products.map((item) => (
              <ProductCard
                key={item._id}
                product={item}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        </div>
      </section>

      {/* QUICK VIEW MODAL */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}

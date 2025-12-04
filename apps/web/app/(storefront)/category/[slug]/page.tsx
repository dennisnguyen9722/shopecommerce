'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProductCard from '@/app/(storefront)/components/productCard'
import ProductFilterSidebar from '@/app/(storefront)/components/ProductFilterSidebar'
import serverApi from '@/src/lib/serverApi'

type CategoryAPI = { _id: string; name: string; slug: string }
type ProductAPI = {
  _id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  category?: { _id: string; name: string; slug: string }
  createdAt?: string
  isFeatured?: boolean
  isPublished?: boolean
}

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState<CategoryAPI | null>(null)
  const [categories, setCategories] = useState<CategoryAPI[]>([]) // ✅ ADDED
  const [allProducts, setAllProducts] = useState<ProductAPI[]>([])
  const [products, setProducts] = useState<ProductAPI[]>([])
  const [filters, setFilters] = useState<any>({ sort: 'newest' })
  const [loading, setLoading] = useState(true)

  // ✅ Load all categories
  useEffect(() => {
    serverApi
      .get('/public/categories')
      .then(({ data }) => setCategories(data || []))
      .catch((err) => console.error('Failed to load categories:', err))
  }, [])

  // Load category info
  useEffect(() => {
    serverApi
      .get(`/public/categories/slug/${slug}`)
      .then(({ data }) => setCategory(data))
      .catch((err) => console.error('Failed to load category:', err))
  }, [slug])

  // Load products (by category id)
  useEffect(() => {
    if (!category?._id) return

    async function load() {
      setLoading(true)
      try {
        const { data } = await serverApi.get('/public/products', {
          params: { category: category?._id, limit: 999 }
        })

        setAllProducts(
          (data || []).filter((p: ProductAPI) => p.isPublished ?? true)
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [category?._id])

  // Filter logic
  useEffect(() => {
    let list = [...allProducts]

    // PRICE
    const min = Number(filters.minPrice) || 0
    const max = Number(filters.maxPrice) || Infinity
    list = list.filter((p) => p.price >= min && p.price <= max)

    // DISCOUNT
    if (filters.discountOnly) {
      list = list.filter((p) => Number(p.comparePrice || 0) > p.price)
    }

    // FEATURED
    if (filters.onlyHot) {
      list = list.filter((p) => p.isFeatured)
    }

    // NEW (14 days)
    if (filters.onlyNew) {
      const now = Date.now()
      const d14 = 14 * 24 * 60 * 60 * 1000
      list = list.filter(
        (p) => p.createdAt && now - new Date(p.createdAt).getTime() <= d14
      )
    }

    // SORT
    const sort = filters.sort || 'newest'
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'discount')
      list.sort((a, b) => {
        const da =
          Number(a.comparePrice || 0) > a.price
            ? (Number(a.comparePrice) - a.price) / Number(a.comparePrice)
            : 0
        const db =
          Number(b.comparePrice || 0) > b.price
            ? (Number(b.comparePrice) - b.price) / Number(b.comparePrice)
            : 0
        return db - da
      })
    else
      list.sort(
        (a, b) =>
          new Date(b.createdAt || '').getTime() -
          new Date(a.createdAt || '').getTime()
      )

    setProducts(list)
  }, [filters, allProducts])

  return (
    <div className="container mx-auto px-4 max-w-7xl py-12 flex gap-8">
      <ProductFilterSidebar
        categories={categories} // ✅ PASS categories
        categoryId={category?._id}
        onFilterChange={setFilters}
      />

      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {category?.name || 'Sản phẩm'}
          </h1>
          <span className="text-sm text-gray-500">
            {products.length} sản phẩm
          </span>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-orange-600"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy sản phẩm nào</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p as any} />
          ))}
        </div>
      </div>
    </div>
  )
}

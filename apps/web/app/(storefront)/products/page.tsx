'use client'

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

export default function ProductsPage() {
  const [categories, setCategories] = useState<CategoryAPI[]>([])
  const [allProducts, setAllProducts] = useState<ProductAPI[]>([])
  const [products, setProducts] = useState<ProductAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<any>({ sort: 'newest' })

  // Load categories
  useEffect(() => {
    serverApi.get('/public/categories').then(({ data }) => {
      setCategories(data || [])
    })
  }, [])

  // Load ALL products
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data } = await serverApi.get('/public/products', {
          params: { limit: 999 }
        })
        const list = (data || []).filter(
          (p: ProductAPI) => p.isPublished ?? true
        )
        setAllProducts(list)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filter logic
  useEffect(() => {
    let list = [...allProducts]

    // CATEGORY
    if (filters.categoryId) {
      list = list.filter((p) => p.category?._id === filters.categoryId)
    }

    // PRICE
    const min = Number(filters.minPrice) || 0
    const max = Number(filters.maxPrice) || Infinity
    list = list.filter((p) => p.price >= min && p.price <= max)

    // DISCOUNT
    if (filters.discountOnly) {
      list = list.filter((p) => Number(p.comparePrice || 0) > Number(p.price))
    }

    // FEATURED
    if (filters.onlyHot) {
      list = list.filter((p) => p.isFeatured === true)
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
    <div className="container mx-auto px-4 max-w-7xl py-12 flex gap-12">
      <ProductFilterSidebar
        categories={categories}
        onFilterChange={setFilters}
      />

      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Tất cả sản phẩm</h1>

        {loading && <div>Đang tải...</div>}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p as any} />
          ))}
        </div>
      </div>
    </div>
  )
}

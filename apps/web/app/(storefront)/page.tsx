import serverApi from '@/src/lib/serverApi'

import Hero from '@/app/(storefront)/components/hero'
import CategoryGrid from '@/app/(storefront)/components/categoryGrid'

// ⭐ Storefront product sections
import FeaturedProducts from '@/app/(storefront)/components/featuredProducts'
import NewArrivalProducts from '@/app/(storefront)/components/newArrivalProducts'
import DiscountProducts from '@/app/(storefront)/components/discountProducts'

import BlogPreview from '@/app/(storefront)/components/blogPreview'

export default async function HomePage() {
  const { data: banners } = await serverApi.get('/public/banners')
  const { data: categories } = await serverApi.get('/public/categories')

  // Grid all products
  const { data: products } = await serverApi.get('/public/products')

  // Featured
  const { data: featured } = await serverApi.get('/public/products/featured')

  // New arrivals
  const { data: newProducts } = await serverApi.get('/public/products?sort=new')

  // Discount (có comparePrice > price)
  const { data: discountProducts } = await serverApi.get(
    '/public/products?filter=discount'
  )

  const { data: latestBlogs } = await serverApi.get('/public/blog/latest', {
    params: { limit: 3 }
  })

  return (
    <div className="flex flex-col">
      <Hero banners={banners} />

      <CategoryGrid categories={categories} products={products} />

      <div className="container py-12 space-y-20">
        {/* ⭐ Sản phẩm nổi bật */}
        <FeaturedProducts items={featured} />

        {/* 🔥 Sản phẩm mới về */}
        <NewArrivalProducts items={newProducts} />

        {/* 💸 Sản phẩm giảm giá */}
        <DiscountProducts items={discountProducts} />

        {/* 📰 Blog */}
        <BlogPreview posts={latestBlogs} />
      </div>
    </div>
  )
}

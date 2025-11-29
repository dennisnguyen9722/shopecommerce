import serverApi from '@/src/lib/serverApi'

import Hero from '@/app/(storefront)/components/hero'
import CategoryGrid from '@/app/(storefront)/components/categoryGrid'
import FlashSaleBanner from '@/app/(storefront)/components/flashSaleBanner'

// Product sections
import FeaturedProducts from '@/app/(storefront)/components/featuredProducts'
import NewArrivalProducts from '@/app/(storefront)/components/newArrivalProducts'
import DiscountProducts from '@/app/(storefront)/components/discountProducts'

import BlogPreview from '@/app/(storefront)/components/blogPreview'

export default async function HomePage() {
  // Fetch data
  const { data: banners } = await serverApi.get('/public/banners')
  const { data: categories } = await serverApi.get('/public/categories')
  const { data: products } = await serverApi.get('/public/products')

  const { data: featured } = await serverApi.get('/public/products/featured')
  const { data: newProducts } = await serverApi.get('/public/products/new')
  const { data: discountProducts } = await serverApi.get(
    '/public/products/discount'
  )

  const { data: latestBlogs } = await serverApi.get('/public/blog/latest', {
    params: { limit: 3 }
  })

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO BANNER */}
      <Hero banners={banners} />

      {/* CATEGORY GRID */}
      <CategoryGrid categories={categories} products={products} />

      {/* FLASH SALE BANNER */}
      <FlashSaleBanner />

      {/* PRODUCT SECTIONS */}
      <div className="py-12 space-y-16 md:space-y-20 bg-white">
        <FeaturedProducts items={featured} />
        <NewArrivalProducts items={newProducts} />
        <DiscountProducts items={discountProducts} />
      </div>

      {/* NEWSLETTER SECTION */}
      <section className="w-full py-16 md:py-20 bg-linear-to-br from-orange-500 via-pink-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Đăng ký nhận ưu đãi đặc biệt
          </h2>
          <p className="text-white/90 text-base md:text-lg mb-8">
            Nhận thông tin sản phẩm mới và khuyến mãi hấp dẫn mỗi tuần
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-xl text-white placeholder-white/60 focus:outline-none focus:border-white/60 transition-all"
            />
            <button className="px-8 py-4 rounded-2xl font-bold bg-white text-orange-500 hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-2xl">
              Đăng ký ngay
            </button>
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <BlogPreview posts={latestBlogs} />
    </div>
  )
}

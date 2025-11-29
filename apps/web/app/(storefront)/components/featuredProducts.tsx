'use client'

import ProductCard from './productCard'

export default function FeaturedProducts({ items }: { items: any[] }) {
  if (!items || items.length === 0) return null

  return (
    <section className="container py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          🔥 Sản phẩm nổi bật
        </h2>

        <a
          href="/products?featured=1"
          className="text-sm text-orange-500 hover:underline"
        >
          Xem thêm
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  )
}

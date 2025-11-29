'use client'

import ProductCard from './productCard'

export default function NewArrivalProducts({ items }: { items: any[] }) {
  if (!items || items.length === 0) return null

  return (
    <section className="container py-12">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        🆕 Sản phẩm mới
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  )
}

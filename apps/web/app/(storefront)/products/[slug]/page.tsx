'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import serverApi from '@/src/lib/serverApi'
import Image from 'next/image'
import ProductCard from '@/app/(storefront)/components/productCard'
import { ShoppingCart, Zap } from 'lucide-react'
import { useCart } from '@/app/contexts/CartContext'
import { useToast } from '@/app/(storefront)/components/ToastProvider'

type Product = {
  _id: string
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number | null
  hasDiscount?: boolean
  images?: { url: string }[]
  category?: { _id: string; name: string; slug: string } | null
  isPublished?: boolean
}

export default function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        // Fetch product detail
        const { data: p } = await serverApi.get(`/public/products/${slug}`)
        if (!mounted) return
        setProduct(p)

        // Fetch related products
        if (p?.category?._id) {
          const { data: rel } = await serverApi.get('/public/products', {
            params: {
              category: p.category._id,
              limit: 8,
              sort: 'newest'
            }
          })

          const filtered = (rel || []).filter(
            (x: Product) => x._id !== p._id && (x.isPublished ?? true)
          )

          setRelated(filtered)
        } else {
          setRelated([])
        }
      } catch (err) {
        console.error('Product fetch error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [slug])

  if (loading) return <div className="p-6">Đang tải...</div>
  if (!product) return <div className="p-6">Không tìm thấy sản phẩm.</div>

  const showComparePrice =
    typeof product.comparePrice === 'number' &&
    product.comparePrice > product.price

  return (
    <div className="container mx-auto px-4 max-w-7xl py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT IMAGE */}
        <div>
          <div className="rounded-xl border p-6 bg-white">
            <div className="w-full aspect-[4/3] relative">
              <Image
                src={product.images?.[0]?.url || ''}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>

            {/* Thumbnails */}
            <div className="mt-4 flex gap-3">
              {product.images?.map((img, i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded overflow-hidden border"
                >
                  <Image
                    src={img.url}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT INFO */}
        <div>
          <h1 className="text-2xl font-semibold mb-3">{product.name}</h1>

          <div className="mb-4">
            <div className="text-2xl font-bold text-orange-600">
              {product.price.toLocaleString('vi-VN')}₫
            </div>

            {/* FIX: Chỉ hiển thị nếu comparePrice > price */}
            {showComparePrice && (
              <div className="text-sm text-gray-400 line-through">
                {product.comparePrice?.toLocaleString('vi-VN')}₫
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => {
                addToCart({
                  _id: product._id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  quantity: 1,
                  image: product.images?.[0]?.url
                })
                showToast(product.name, product.images?.[0]?.url)
              }}
              className="
                w-full py-3 rounded-full font-semibold text-base
                bg-gradient-to-r from-orange-500 to-pink-500
                text-white shadow-lg
                transition-all duration-300
                flex items-center justify-center gap-2
                hover:shadow-xl hover:scale-[1.02]
              "
            >
              <ShoppingCart className="w-5 h-5" />
              Thêm vào giỏ
            </button>

            <button
              onClick={(e) => {
                e.preventDefault()
                // TODO: Buy now
              }}
              className="
                w-full py-3 rounded-full font-semibold text-base
                bg-black text-white
                shadow-lg
                transition-all duration-300
                flex items-center justify-center gap-2
                hover:shadow-xl hover:scale-[1.02]
              "
            >
              <Zap className="w-5 h-5" />
              Mua ngay
            </button>
          </div>

          {/* CATEGORY */}
          <div className="text-sm text-gray-600 mb-4">
            Danh mục:{' '}
            {product.category ? (
              <span className="font-medium">{product.category.name}</span>
            ) : (
              <span className="italic text-gray-400">Không có</span>
            )}
          </div>

          {/* DESCRIPTION */}
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description || '' }}
          />
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <section className="mt-14">
          <h3 className="text-lg font-semibold mb-4">Sản phẩm liên quan</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {related.map((r) => (
              <ProductCard key={r._id} product={r as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

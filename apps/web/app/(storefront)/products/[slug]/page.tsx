'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import serverApi from '@/src/lib/serverApi'
import Image from 'next/image'
import ProductCard from '@/app/(storefront)/components/productCard'
import {
  ShoppingCart,
  Zap,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react'
import { useCart } from '@/app/contexts/CartContext'
import { useToast } from '@/app/(storefront)/components/ToastProvider'

// 👇 Import 2 Component mới làm
import ProductVariantSelector from './components/ProductVariantSelector'
import ProductSpecs from './components/ProductSpecs'

// Cập nhật Type cho đầy đủ
type Product = {
  _id: string
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  hasDiscount?: boolean
  images?: { url: string }[]
  category?: { _id: string; name: string; slug: string } | null
  isPublished?: boolean
  brand?: string
  // 👇 Các trường mới
  stock: number
  hasVariants?: boolean
  variantGroups?: any[]
  variants?: any[]
  specs?: any[]
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

  // 🟢 State lưu biến thể đang chọn
  const [activeVariant, setActiveVariant] = useState<any>(null)

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
              limit: 4, // Lấy 4 cái cho đẹp layout
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

  if (loading)
    return (
      <div className="p-12 text-center text-gray-500">Đang tải sản phẩm...</div>
    )
  if (!product)
    return (
      <div className="p-12 text-center text-gray-500">
        Không tìm thấy sản phẩm.
      </div>
    )

  // 🟢 LOGIC TÍNH GIÁ & TỒN KHO HIỂN THỊ
  // Nếu chọn biến thể -> Lấy giá biến thể. Không thì lấy giá gốc
  const displayPrice = activeVariant ? activeVariant.price : product.price
  const displayStock = activeVariant ? activeVariant.stock : product.stock
  const isOutOfStock = displayStock <= 0

  // Logic hiển thị giá gốc (gạch ngang)
  const showComparePrice =
    typeof product.comparePrice === 'number' &&
    product.comparePrice > displayPrice

  // 🟢 XỬ LÝ THÊM GIỎ HÀNG
  const handleAddToCart = () => {
    // 1. Kiểm tra nếu có biến thể mà chưa chọn
    if (product.hasVariants && !activeVariant) {
      // Dùng alert hoặc toast báo lỗi (Ở đây mình dùng alert cho nhanh, bạn có thể dùng toast error)
      alert('Vui lòng chọn phân loại hàng (Màu sắc/Kích thước)!')
      return
    }

    if (isOutOfStock) {
      alert('Sản phẩm tạm hết hàng!')
      return
    }

    // 2. Thêm vào giỏ
    addToCart({
      _id: product._id, // ID gốc sản phẩm
      name: product.name,
      slug: product.slug,
      price: displayPrice, // Giá theo biến thể
      quantity: 1,
      image: product.images?.[0]?.url,
      // 👇 Gửi thêm thông tin biến thể
      variantId: activeVariant?._id,
      variantName: activeVariant
        ? Object.values(activeVariant.options).join(' / ')
        : ''
    })

    showToast(product.name, product.images?.[0]?.url)
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT: IMAGE GALLERY */}
        <div>
          <div className="rounded-2xl border border-gray-100 p-2 bg-white shadow-sm overflow-hidden">
            <div className="w-full aspect-[4/3] relative rounded-xl overflow-hidden bg-gray-50">
              <Image
                src={product.images?.[0]?.url || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-orange-500 transition-colors flex-shrink-0 bg-white"
                >
                  <Image
                    src={img.url}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: INFO & ACTIONS */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            {product.brand && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-bold uppercase">
                {product.brand}
              </span>
            )}
            <span className="text-xs text-gray-400">
              Mã SP: {activeVariant?.sku || 'SKU-DEFAULT'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>

          {/* PRICE BLOCK */}
          <div className="bg-gray-50/50 rounded-xl p-4 mb-6 border border-gray-100">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-orange-600">
                {displayPrice.toLocaleString('vi-VN')}₫
              </span>
              {showComparePrice && (
                <span className="text-lg text-gray-400 line-through">
                  {product.comparePrice?.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>

            {/* Tồn kho label */}
            <div className="mt-2 text-sm">
              {isOutOfStock ? (
                <span className="text-red-500 font-medium">Hết hàng</span>
              ) : (
                <span className="text-green-600 font-medium">
                  Còn {displayStock} sản phẩm
                </span>
              )}
            </div>
          </div>

          {/* 🟢 BIẾN THỂ (VARIANTS) */}
          {product.hasVariants && product.variantGroups && (
            <ProductVariantSelector
              groups={product.variantGroups}
              variants={product.variants || []}
              onVariantChange={setActiveVariant}
            />
          )}

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 mb-8 mt-6">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`
                flex-1 py-3.5 rounded-full font-bold text-base shadow-lg
                flex items-center justify-center gap-2 transition-all duration-300
                ${
                  isOutOfStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-xl hover:scale-[1.02]'
                }
              `}
            >
              <ShoppingCart className="w-5 h-5" />
              {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
            </button>

            <button
              disabled={isOutOfStock}
              className={`
                flex-1 py-3.5 rounded-full font-bold text-base shadow-lg
                flex items-center justify-center gap-2 transition-all duration-300
                ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-black hover:shadow-xl hover:scale-[1.02]'
                }
              `}
            >
              <Zap className="w-5 h-5" />
              Mua ngay
            </button>
          </div>

          {/* POLICIES */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-8 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-600" /> Bảo hành
              chính hãng
            </div>
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-blue-600" /> Giao hàng toàn quốc
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={18} className="text-orange-600" /> Đổi trả trong
              7 ngày
            </div>
            <div className="flex items-center gap-2">
              <Check size={18} className="text-purple-600" /> Kiểm tra khi nhận
              hàng
            </div>
          </div>

          {/* CATEGORY & DESC */}
          <div className="text-sm text-gray-600 mb-6 pt-6 border-t border-gray-100">
            Danh mục:{' '}
            {product.category ? (
              <span className="font-medium text-gray-900">
                {product.category.name}
              </span>
            ) : (
              <span className="italic text-gray-400">Không có</span>
            )}
          </div>

          {/* 🟢 THÔNG SỐ KỸ THUẬT (Nếu có) */}
          {product.specs && product.specs.length > 0 && (
            <ProductSpecs specs={product.specs} />
          )}

          {/* DESCRIPTION */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-3">Mô tả sản phẩm</h3>
            <div
              className="prose max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
            />
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <section className="mt-20 pt-10 border-t border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-center">
            Sản phẩm liên quan
          </h3>
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

'use client'

import { useEffect, useState, use, useMemo } from 'react'
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
  RotateCcw,
  FileText,
  Cpu,
  Heart,
  Share2,
  ChevronRight,
  Star,
  Award,
  Package,
  X,
  ChevronLeft
} from 'lucide-react'
import { useCart } from '@/app/contexts/CartContext'
import { useToast } from '@/app/(storefront)/components/ToastProvider'

import ProductVariantSelector from './components/ProductVariantSelector'
import ProductSpecs from './components/ProductSpecs'

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

  // State biến thể
  const [activeVariant, setActiveVariant] = useState<any>(null)

  // 🎨 UI States (Giữ nguyên của bạn)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // State phụ để xử lý việc đổi ảnh variant (nếu ảnh đó ko nằm trong gallery)
  const [variantImageOverride, setVariantImageOverride] = useState<
    string | null
  >(null)

  const { addToCart } = useCart()
  const { showToast } = useToast()
  const router = useRouter()

  // 1. Fetch dữ liệu
  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const { data: p } = await serverApi.get(`/public/products/${slug}`)
        if (!mounted) return
        setProduct(p)

        if (p?.category?._id) {
          const { data: rel } = await serverApi.get('/public/products', {
            params: {
              category: p.category._id,
              limit: 4,
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

  // 🔥 2. LOGIC MỚI: ĐỔI ẢNH KHI CHỌN BIẾN THỂ (Đã nhúng vào giao diện cũ)
  useEffect(() => {
    if (activeVariant && activeVariant.image) {
      // Tìm xem ảnh của variant này có nằm trong list ảnh chính không
      const foundIndex = product?.images?.findIndex(
        (img) => img.url === activeVariant.image
      )

      if (foundIndex !== undefined && foundIndex !== -1) {
        // Nếu có trong list -> Chọn index đó (để highlight thumbnail)
        setSelectedImage(foundIndex)
        setVariantImageOverride(null)
      } else {
        // Nếu không có trong list -> Force hiển thị ảnh này
        setVariantImageOverride(activeVariant.image)
      }
    } else {
      // Nếu bỏ chọn variant hoặc variant không có ảnh -> Reset về ảnh mặc định
      setVariantImageOverride(null)
    }
  }, [activeVariant, product])

  // Logic Groups
  const derivedGroups = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return []
    if (product.variantGroups && product.variantGroups.length > 0) {
      return product.variantGroups
    }
    const groupsMap: Record<string, Set<string>> = {}
    product.variants.forEach((v: any) => {
      if (v.options) {
        Object.entries(v.options).forEach(([key, value]) => {
          if (!groupsMap[key]) groupsMap[key] = new Set()
          groupsMap[key].add(String(value))
        })
      }
    })
    return Object.entries(groupsMap).map(([name, valuesSet]) => ({
      name,
      values: Array.from(valuesSet)
    }))
  }, [product])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải...</p>
        </div>
      </div>
    )

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm</p>
        </div>
      </div>
    )

  const displayPrice = activeVariant ? activeVariant.price : product.price
  const displayStock = activeVariant ? activeVariant.stock : product.stock || 0
  const isOutOfStock = displayStock <= 0
  const showComparePrice =
    typeof product.comparePrice === 'number' &&
    product.comparePrice > displayPrice

  const savings = showComparePrice
    ? (product.comparePrice || 0) - displayPrice
    : 0
  const savingsPercent = showComparePrice
    ? Math.round((savings / (product.comparePrice || 1)) * 100)
    : 0

  // Xác định ảnh đang hiển thị (Ưu tiên ảnh variant override -> rồi đến ảnh theo index)
  const currentDisplayImage =
    variantImageOverride ||
    product.images?.[selectedImage]?.url ||
    '/placeholder.png'

  const handleAddToCart = () => {
    if (derivedGroups.length > 0 && !activeVariant) {
      alert('Vui lòng chọn phân loại hàng!')
      return
    }
    if (isOutOfStock) {
      alert('Sản phẩm tạm hết hàng!')
      return
    }
    addToCart({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      quantity: 1,
      image: currentDisplayImage, // Lưu ảnh đang thấy vào giỏ
      variantId: activeVariant?._id,
      variantName: activeVariant
        ? Object.values(activeVariant.options).join(' / ')
        : ''
    })
    showToast(product.name, currentDisplayImage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* LEFT: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative group">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border-2 border-gray-100 shadow-xl p-4">
                <div className="w-full h-full relative">
                  <Image
                    src={currentDisplayImage}
                    alt={product.name}
                    fill
                    className="object-contain transition-transform duration-300 cursor-pointer hover:scale-105"
                    onClick={() => setLightboxOpen(true)}
                  />
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {showComparePrice && (
                  <>
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                      -{savingsPercent}%
                    </span>
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      HOT
                    </span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-10 h-10 rounded-full backdrop-blur-md shadow-lg flex items-center justify-center transition-all ${
                    isLiked
                      ? 'bg-red-500 text-white scale-110'
                      : 'bg-white/90 text-gray-600 hover:bg-white'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
                  />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white transition-all text-gray-600">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(idx)
                      setVariantImageOverride(null) // Reset override khi chọn thủ công
                    }}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx && !variantImageOverride
                        ? 'border-orange-500 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={product.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges Row */}
            <div className="grid grid-cols-4 gap-3 pt-4">
              {[
                {
                  icon: Award,
                  text: 'Chính hãng 100%',
                  color: 'text-blue-600'
                },
                {
                  icon: ShieldCheck,
                  text: 'Bảo hành hãng',
                  color: 'text-green-600'
                },
                {
                  icon: Truck,
                  text: 'Giao toàn quốc',
                  color: 'text-orange-600'
                },
                {
                  icon: RotateCcw,
                  text: 'Đổi trả 7 ngày',
                  color: 'text-purple-600'
                }
              ].map((badge, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-2 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center justify-center"
                >
                  <badge.icon
                    className={`w-5 h-5 ${badge.color} mb-1 group-hover:scale-110 transition-transform`}
                  />
                  <p className="text-[10px] sm:text-xs text-gray-600 font-medium leading-tight">
                    {badge.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="space-y-6">
            {/* Brand & SKU */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {product.brand && (
                  <span className="bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wide shadow-md">
                    {product.brand}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-500">
                SKU: {activeVariant?.sku || 'DEFAULT'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Price Card */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
              <div className="flex items-end gap-4 mb-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Giá bán</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-orange-600">
                      {displayPrice.toLocaleString('vi-VN')}₫
                    </span>
                    {showComparePrice && (
                      <span className="text-xl text-gray-400 line-through">
                        {product.comparePrice?.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                </div>
                {showComparePrice && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-md">
                    -{savingsPercent}%
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                {showComparePrice && (
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    Tiết kiệm {savings.toLocaleString('vi-VN')}₫
                  </div>
                )}
                <div
                  className={`font-medium ${
                    isOutOfStock ? 'text-red-500' : 'text-green-600'
                  }`}
                >
                  {isOutOfStock
                    ? 'Hết hàng'
                    : `Còn ${(displayStock || 0).toLocaleString()} sản phẩm`}
                </div>
              </div>
            </div>

            {/* Variant Selector */}
            {product.variants &&
              product.variants.length > 0 &&
              derivedGroups.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <ProductVariantSelector
                    groups={derivedGroups}
                    variants={product.variants}
                    onVariantChange={setActiveVariant}
                  />
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`
                  flex-1 py-4 rounded-xl font-bold text-lg shadow-xl
                  flex items-center justify-center gap-2 transition-all duration-300
                  ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
              >
                <ShoppingCart className="w-6 h-6" />
                {isOutOfStock ? 'Hết hàng' : 'Thêm giỏ hàng'}
              </button>
              <button
                disabled={isOutOfStock}
                className={`
                  flex-1 py-4 rounded-xl font-bold text-lg shadow-xl
                  flex items-center justify-center gap-2 transition-all duration-300
                  ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-black hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
              >
                <Zap className="w-6 h-6" />
                Mua ngay
              </button>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3 text-sm bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span>Được kiểm tra hàng</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <span>Hỗ trợ trả góp 0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 👇 GIAO DIỆN TABS ĐÃ QUAY LẠI 👇 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-12">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'description', label: 'Mô tả sản phẩm', icon: FileText },
              { id: 'specs', label: 'Thông số kỹ thuật', icon: Cpu }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      product.description ||
                      '<p class="text-gray-400 italic">Đang cập nhật...</p>'
                  }}
                />
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="-mt-8">
                {product.specs && product.specs.length > 0 ? (
                  <ProductSpecs specs={product.specs} />
                ) : (
                  <p className="text-gray-400 italic text-center py-12">
                    Chưa có thông số chi tiết.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sản phẩm liên quan
              </h2>
              <p className="text-gray-600">
                Khám phá thêm các sản phẩm tương tự
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {related.map((r) => (
                <ProductCard key={r._id} product={r as any} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox - Giữ nguyên của bạn */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors z-[10000]"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative max-w-6xl max-h-[90vh] w-full flex items-center justify-center">
            <Image
              src={currentDisplayImage}
              alt={product.name}
              width={1200}
              height={900}
              className="object-contain max-h-[90vh] w-auto"
            />
          </div>
        </div>
      )}
    </div>
  )
}

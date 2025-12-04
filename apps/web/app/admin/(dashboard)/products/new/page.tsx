'use client'

import { useState } from 'react'
import api from '@/src/lib/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { generateSlug } from '@/lib/utils'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import ImageUploader from '@/src/components/admin/ImageUploader'
import PriceInputShopifyPlus from '@/src/components/admin/PriceInput'
import GlassCard from '@/src/components/admin/GlassCard'
import Editor from '@/src/components/editor/Editor'
import VariantManager from '@/src/components/admin/VariantManager'
import SpecsManager from '@/src/components/admin/SpecsManager'

import { ToggleLeft, ToggleRight, Layers, Settings2 } from 'lucide-react'

type Category = {
  _id: string
  name: string
  isActive?: boolean
}

type CategoriesResponse = {
  items: Category[]
}

export default function CreateProductPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [comparePrice, setComparePrice] = useState<number>(0)
  const [stock, setStock] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<{ url: string; public_id: string }[]>([])
  const [categoryId, setCategoryId] = useState<string>('')

  const [isPublished, setIsPublished] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)

  // STATE CHO BIẾN THỂ & SPECS
  const [hasVariants, setHasVariants] = useState(false)
  const [variantGroups, setVariantGroups] = useState<
    { name: string; values: string[] }[]
  >([])
  const [variants, setVariants] = useState<any[]>([])
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])

  // 👇 CẬP NHẬT LOGIC AUTO-SLUG
  const handleName = (value: string) => {
    setName(value)
    // Tự động tạo slug chuẩn khi nhập tên
    setSlug(generateSlug(value))
  }

  // load category list
  const { data: catData } = useQuery<CategoriesResponse>({
    queryKey: ['admin-categories-for-product-form'],
    queryFn: async () => {
      const res = await api.get('/admin/categories')
      return res.data
    }
  })

  const categories = catData?.items ?? []
  const activeCategories = categories.filter((c) => c.isActive !== false)

  const mut = useMutation({
    mutationFn: async () => {
      const res = await api.post('/admin/products', {
        name,
        slug,
        price,
        comparePrice,
        stock: hasVariants
          ? variants.reduce((acc, v) => acc + v.stock, 0)
          : stock, // Nếu có variant, stock tổng = tổng stock variant
        description,
        images,
        category: categoryId || undefined,
        isPublished,
        isFeatured,
        hasVariants,
        variantGroups,
        variants,
        specs
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Tạo sản phẩm thành công!')
      router.push('/admin/products')
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Lỗi khi tạo sản phẩm!')
    }
  })

  const handleCreate = () => {
    mut.mutate()
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            Sản phẩm / Tạo mới
          </div>
          <h1 className="text-2xl font-semibold flex items-center gap-2 mt-1">
            <span className="text-purple-600 text-3xl leading-none">＋</span>
            Tạo sản phẩm mới
          </h1>
        </div>

        <Button onClick={handleCreate} disabled={mut.isPending}>
          {mut.isPending ? 'Đang tạo...' : 'Tạo sản phẩm'}
        </Button>
      </div>

      {/* GLASSCARD: THÔNG TIN CHUNG */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Thông tin chung</h2>
          <p className="text-sm text-muted-foreground">
            Tên, slug, danh mục và các thông tin cơ bản của sản phẩm.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tên sản phẩm</Label>
            <Input
              value={name}
              onChange={(e) => handleName(e.target.value)}
              placeholder="Ví dụ: iPhone 15 Pro Max"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={slug}
              // Cho phép sửa tay nhưng vẫn format chuẩn
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              placeholder="iphone-15-pro-max"
              required
            />
            <p className="text-xs text-muted-foreground">
              Chuỗi định danh URL (tự động loại bỏ ký tự đặc biệt như /)
            </p>
          </div>

          <div className="space-y-2 max-w-sm">
            <Label>Danh mục</Label>
            <Select
              value={categoryId}
              onValueChange={(val) => setCategoryId(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {activeCategories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 max-w-md gap-6 pt-4">
            <div className="space-y-2">
              <Label>Công khai (isPublished)</Label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className="flex items-center gap-2"
              >
                {isPublished ? (
                  <ToggleRight className="w-6 h-6 text-green-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
                <span>{isPublished ? 'Đang hiển thị' : 'Đang ẩn'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <Label>Nổi bật (isFeatured)</Label>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className="flex items-center gap-2"
              >
                {isFeatured ? (
                  <ToggleRight className="w-6 h-6 text-yellow-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
                <span>{isFeatured ? 'Nổi bật' : 'Không nổi bật'}</span>
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* HÌNH ẢNH */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Hình ảnh sản phẩm</h2>
          <p className="text-sm text-muted-foreground">
            Thêm ảnh để hiển thị trên storefront và trang chi tiết sản phẩm.
          </p>
        </div>
        <ImageUploader initial={[]} onChange={(imgs) => setImages(imgs)} />
      </GlassCard>

      {/* GIÁ & TỒN KHO */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Giá & Tồn kho (Cơ bản)</h2>
          <p className="text-sm text-muted-foreground">
            Nếu có biến thể, tồn kho sẽ được tính theo từng biến thể.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Giá bán (Giá hiển thị)</Label>
            <PriceInputShopifyPlus value={price} onChange={setPrice} />
          </div>

          <div className="space-y-2">
            <Label>Giá gốc (compare price)</Label>
            <PriceInputShopifyPlus
              value={comparePrice}
              onChange={setComparePrice}
            />
          </div>
        </div>

        {!hasVariants && (
          <div className="space-y-2 mt-6 max-w-xs">
            <Label>Số lượng tồn kho</Label>
            <Input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              required
            />
          </div>
        )}
      </GlassCard>

      {/* QUẢN LÝ BIẾN THỂ (VARIANTS) */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="text-orange-600" size={20} />
            <div>
              <h2 className="text-lg font-semibold">Biến thể sản phẩm</h2>
              <p className="text-sm text-muted-foreground">
                Màu sắc, Dung lượng, Kích thước...
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setHasVariants(!hasVariants)}
            className="flex items-center gap-2"
          >
            {hasVariants ? (
              <ToggleRight className="w-8 h-8 text-orange-600" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-gray-400" />
            )}
            <span
              className={
                hasVariants ? 'font-semibold text-orange-600' : 'text-gray-500'
              }
            >
              {hasVariants ? 'Đang bật' : 'Chưa kích hoạt'}
            </span>
          </button>
        </div>

        {hasVariants ? (
          <VariantManager
            groups={variantGroups}
            setGroups={setVariantGroups}
            variants={variants}
            setVariants={setVariants}
            basePrice={price}
          />
        ) : (
          <div className="text-center py-8 text-gray-400 bg-gray-50/50 rounded-lg border border-dashed">
            Sản phẩm này không có biến thể (Sản phẩm đơn).
          </div>
        )}
      </GlassCard>

      {/* THÔNG SỐ KỸ THUẬT (SPECS) */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4 flex items-center gap-2">
          <Settings2 className="text-blue-600" size={20} />
          <div>
            <h2 className="text-lg font-semibold">Thông số kỹ thuật</h2>
            <p className="text-sm text-muted-foreground">
              Chip, RAM, Camera, Pin...
            </p>
          </div>
        </div>

        <SpecsManager specs={specs} setSpecs={setSpecs} />
      </GlassCard>

      {/* MÔ TẢ CHI TIẾT */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Mô tả chi tiết</h2>
          <p className="text-sm text-muted-foreground">
            Nội dung chi tiết hiển thị trên trang sản phẩm.
          </p>
        </div>

        <Editor value={description} onChange={setDescription} />
      </GlassCard>
    </div>
  )
}

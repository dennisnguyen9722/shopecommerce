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

import {
  ToggleLeft,
  ToggleRight,
  Layers,
  Settings2,
  Building2
} from 'lucide-react'

type Category = { _id: string; name: string; isActive?: boolean }
type Brand = { _id: string; name: string; slug: string; logo?: string }
type CategoriesResponse = { items: Category[] }

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
  const [brandId, setBrandId] = useState<string>('') // ✅ NEW: Brand state
  const [isPublished, setIsPublished] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)

  const [hasVariants, setHasVariants] = useState(false)
  const [variantGroups, setVariantGroups] = useState<
    { name: string; values: string[] }[]
  >([])
  const [variants, setVariants] = useState<any[]>([])
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])

  const handleName = (value: string) => {
    setName(value)
    setSlug(generateSlug(value))
  }

  // Lấy danh mục
  const { data: catData } = useQuery<CategoriesResponse>({
    queryKey: ['admin-categories-list'],
    queryFn: async () => {
      const res = await api.get('/admin/categories')
      return res.data
    }
  })
  const categories = catData?.items ?? []
  const activeCategories = categories.filter((c) => c.isActive !== false)

  // ✅ NEW: Lấy danh sách thương hiệu
  const { data: brandsData } = useQuery<Brand[]>({
    queryKey: ['admin-brands-all'],
    queryFn: async () => {
      const res = await api.get('/admin/brands/all')
      return res.data
    }
  })
  const brands = brandsData ?? []

  // API Tạo sản phẩm
  const mut = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        slug,
        price,
        comparePrice,
        stock: hasVariants
          ? variants.reduce((acc, v) => acc + (v.stock || 0), 0)
          : stock,
        description,
        images,
        category: categoryId || undefined,
        brand: brandId || undefined, // ✅ NEW: Thêm brand vào payload
        isPublished,
        isFeatured,
        hasVariants,
        variantGroups,
        variants,
        specs
      }

      const res = await api.post('/admin/products', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Tạo sản phẩm thành công!')
      router.push('/admin/products')
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Lỗi khi tạo sản phẩm')
    }
  })

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            Sản phẩm / Tạo mới
          </div>
          <h1 className="text-2xl font-semibold mt-1 dark:text-gray-900">
            Tạo sản phẩm mới
          </h1>
        </div>
        <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
          {mut.isPending ? 'Đang xử lý...' : 'Lưu sản phẩm'}
        </Button>
      </div>

      {/* 1. THÔNG TIN CHUNG */}
      <GlassCard>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tên sản phẩm</Label>
            <Input
              value={name}
              onChange={(e) => handleName(e.target.value)}
              placeholder="Tên sản phẩm..."
            />
          </div>
          <div className="space-y-2">
            <Label>Slug (URL)</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
            />
          </div>

          {/* ✅ NEW: Grid layout cho Category và Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Danh mục */}
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select
                value={categoryId || 'none'}
                onValueChange={(v) => setCategoryId(v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {activeCategories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ✅ NEW: Thương hiệu */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-500" />
                Thương hiệu
              </Label>
              <Select
                value={brandId || 'none'}
                onValueChange={(v) => setBrandId(v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thương hiệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand._id} value={brand._id}>
                      <div className="flex items-center gap-2">
                        {brand.logo && (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-4 h-4 rounded object-contain"
                          />
                        )}
                        <span>{brand.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-6 pt-2">
            <div className="space-y-2">
              <Label>Hiển thị</Label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className="flex items-center gap-2"
              >
                {isPublished ? (
                  <ToggleRight className="text-green-500 w-6 h-6" />
                ) : (
                  <ToggleLeft className="text-gray-400 w-6 h-6" />
                )}
              </button>
            </div>
            <div className="space-y-2">
              <Label>Nổi bật</Label>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className="flex items-center gap-2"
              >
                {isFeatured ? (
                  <ToggleRight className="text-yellow-500 w-6 h-6" />
                ) : (
                  <ToggleLeft className="text-gray-400 w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 2. HÌNH ẢNH */}
      <GlassCard>
        <h2 className="font-semibold mb-4">Hình ảnh sản phẩm (Gallery)</h2>
        <ImageUploader initial={[]} onChange={setImages} />
      </GlassCard>

      {/* 3. GIÁ & KHO */}
      <GlassCard>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Giá bán</Label>
            <PriceInputShopifyPlus value={price} onChange={setPrice} />
          </div>
          <div className="space-y-2">
            <Label>Giá gốc</Label>
            <PriceInputShopifyPlus
              value={comparePrice}
              onChange={setComparePrice}
            />
          </div>
        </div>
        {!hasVariants && (
          <div className="mt-4 max-w-xs space-y-2">
            <Label>Tồn kho</Label>
            <Input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
            />
          </div>
        )}
      </GlassCard>

      {/* 4. BIẾN THỂ */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4 border-b pb-4">
          <div className="flex items-center gap-2">
            <Layers className="text-orange-600" />
            <h2 className="font-semibold">Biến thể</h2>
          </div>
          <button
            type="button"
            onClick={() => setHasVariants(!hasVariants)}
            className="flex items-center gap-2"
          >
            {hasVariants ? (
              <ToggleRight className="text-orange-600 w-8 h-8" />
            ) : (
              <ToggleLeft className="text-gray-400 w-8 h-8" />
            )}
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
          <p className="text-center text-gray-400 py-6">
            Sản phẩm đơn (Không có biến thể)
          </p>
        )}
      </GlassCard>

      {/* 5. THÔNG SỐ & MÔ TẢ */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="text-blue-600" />
          <h2 className="font-semibold">Thông số kỹ thuật</h2>
        </div>
        <SpecsManager specs={specs} setSpecs={setSpecs} />
      </GlassCard>

      <GlassCard>
        <h2 className="font-semibold mb-4">Mô tả chi tiết</h2>
        <Editor value={description} onChange={setDescription} />
      </GlassCard>
    </div>
  )
}

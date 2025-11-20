'use client'

import { useState } from 'react'
// import dynamic from 'next/dynamic'
import api from '@/src/lib/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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

// const RichTextEditor = dynamic(
//   () => import('@/src/components/admin/RichTextEditor'),
//   { ssr: false }
// )

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

  // Auto-slug
  const handleName = (value: string) => {
    setName(value)
    setSlug(
      value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
    )
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
        stock,
        description,
        images,
        category: categoryId || undefined
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
              placeholder="Ví dụ: Áo thun nam Basic"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ao-thun-nam-basic"
              required
            />
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
        </div>
      </GlassCard>

      {/* GLASSCARD: HÌNH ẢNH */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Hình ảnh sản phẩm</h2>
          <p className="text-sm text-muted-foreground">
            Thêm ảnh để hiển thị trên storefront và trang chi tiết sản phẩm.
          </p>
        </div>

        <ImageUploader initial={[]} onChange={(imgs) => setImages(imgs)} />
      </GlassCard>

      {/* GLASSCARD: GIÁ & TỒN KHO */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Giá & Tồn kho</h2>
          <p className="text-sm text-muted-foreground">
            Thiết lập giá bán, giá gốc và số lượng tồn kho.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Giá bán</Label>
            <PriceInputShopifyPlus
              value={price}
              onChange={(v) => setPrice(v)}
            />
          </div>

          <div className="space-y-2">
            <Label>Giá gốc (compare price)</Label>
            <PriceInputShopifyPlus
              value={comparePrice}
              onChange={(v) => setComparePrice(v)}
            />
          </div>
        </div>

        <div className="space-y-2 mt-6 max-w-xs">
          <Label>Số lượng tồn kho</Label>
          <Input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            required
          />
        </div>
      </GlassCard>

      {/* GLASSCARD: MÔ TẢ CHI TIẾT */}
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

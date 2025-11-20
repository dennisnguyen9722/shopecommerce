'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import api from '@/src/lib/api'
import ImageUploader from '@/src/components/admin/ImageUploader'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

import PriceInputShopifyPlus from '@/src/components/admin/PriceInput'
import { toast } from 'sonner'

import AdjustStockModal from '@/src/components/admin/AdjustStockModal'
import InventoryLog from '@/src/components/admin/InventoryLog'
import GlassCard from '@/src/components/admin/GlassCard'
import Editor from '@/src/components/editor/Editor'

export default function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const queryClient = useQueryClient()

  const [openAdjust, setOpenAdjust] = useState(false)

  const {
    handleSubmit,
    control,
    reset,
    watch,
    register,
    getValues,
    formState: { isSubmitting }
  } = useForm()

  // FETCH PRODUCT
  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/admin/products/${id}`)
      return res.data
    }
  })

  // FETCH CATEGORIES
  const { data: catData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/admin/categories')
      return res.data.items || []
    }
  })

  const categories = catData ?? []

  // RESET FORM WHEN data READY
  useEffect(() => {
    if (!data) return

    const catId =
      data.category && typeof data.category === 'object'
        ? data.category._id
        : data.category || null

    reset({
      ...data,
      description: data.description || '',
      price: data.price || 0,
      comparePrice: data.comparePrice || 0,
      category: catId || 'none',
      stock: data.stock || 0,
      images: data.images || []
    })
  }, [data, reset])

  // UPDATE PRODUCT
  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        ...values,
        category: values.category === 'none' ? null : values.category
      }
      const res = await api.put(`/admin/products/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Lưu sản phẩm thành công!')
      queryClient.invalidateQueries({ queryKey: ['product', id] })
    },
    onError: () => toast.error('Lưu thất bại! Vui lòng thử lại.')
  })

  const onSubmit = (values: any) => mutation.mutate(values)

  if (isLoading) return <div className="p-6">Đang tải sản phẩm...</div>

  const currentName = (data && data.name) || 'Sản phẩm'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            Sản phẩm / {currentName}
          </div>
          <h1 className="text-2xl font-semibold mt-1">Chỉnh sửa sản phẩm</h1>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setOpenAdjust(true)}>
            Điều chỉnh tồn kho
          </Button>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || mutation.isPending}
          >
            {mutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </div>
      {/* GLASSCARD: THÔNG TIN CHUNG */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Thông tin chung</h2>
          <p className="text-sm text-muted-foreground">
            Tên, slug và danh mục của sản phẩm.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tên sản phẩm</Label>
            <Input {...register('name')} placeholder="Nhập tên sản phẩm" />
          </div>

          <div className="space-y-2 max-w-md">
            <Label>Slug</Label>
            <Input {...register('slug')} placeholder="san-pham" />
          </div>

          <div className="space-y-2 max-w-sm">
            <Label>Danh mục</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  value={field.value || 'none'}
                  onValueChange={(v) => field.onChange(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="none">Không danh mục</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </GlassCard>
      {/* GLASSCARD: HÌNH ẢNH */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Hình ảnh</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý gallery ảnh cho sản phẩm này.
          </p>
        </div>

        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <ImageUploader
              initial={field.value || []}
              onChange={(imgs) => field.onChange(imgs)}
            />
          )}
        />
      </GlassCard>
      {/* GLASSCARD: GIÁ & TỒN KHO */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Giá & Tồn kho</h2>
          <p className="text-sm text-muted-foreground">
            Cập nhật giá bán, giá gốc và theo dõi tồn kho.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Giá bán</Label>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <PriceInputShopifyPlus
                  value={field.value ?? 0}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Giá gốc (compare price)</Label>
            <Controller
              control={control}
              name="comparePrice"
              render={({ field }) => (
                <PriceInputShopifyPlus
                  value={field.value ?? 0}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
          </div>
        </div>

        <div className="space-y-2 mt-6 max-w-xs">
          <Label>Tồn kho hiện tại</Label>
          <Input type="number" {...register('stock')} disabled />
        </div>
      </GlassCard>
      {/* GLASSCARD: MÔ TẢ CHI TIẾT */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Mô tả chi tiết</h2>
          <p className="text-sm text-muted-foreground">
            Nội dung mô tả hiển thị trên trang sản phẩm.
          </p>
        </div>

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Editor value={field.value || ''} onChange={field.onChange} />
          )}
        />
      </GlassCard>
      {/* GLASSCARD: INVENTORY LOG */}
      <InventoryLog productId={id} />
      {/* MODAL ADJUST STOCK */}
      <AdjustStockModal
        productId={id}
        currentStock={watch('stock')}
        open={openAdjust}
        setOpen={setOpenAdjust}
        onUpdated={(newStock) => {
          const values = getValues()
          reset({ ...values, stock: newStock })
        }}
      />
    </div>
  )
}

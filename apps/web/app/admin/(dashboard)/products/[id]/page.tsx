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
import VariantManager from '@/src/components/admin/VariantManager' // 👈 Import Mới
import SpecsManager from '@/src/components/admin/SpecsManager' // 👈 Import Mới

import { ToggleLeft, ToggleRight, Layers, Settings2 } from 'lucide-react'

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
    setValue,
    formState: { isSubmitting }
  } = useForm()

  const hasVariants = watch('hasVariants') // Theo dõi state để ẩn hiện UI

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
      images: data.images || [],
      isFeatured: data.isFeatured || false,
      isPublished: data.isPublished ?? true,
      // 👇 Dữ liệu mới
      hasVariants: data.hasVariants || false,
      variantGroups: data.variantGroups || [],
      variants: data.variants || [],
      specs: data.specs || []
    })
  }, [data, reset])

  // UPDATE PRODUCT
  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        ...values,
        category: values.category === 'none' ? null : values.category,
        // Nếu dùng biến thể, tự động tính tổng stock
        stock: values.hasVariants
          ? values.variants.reduce((acc: number, v: any) => acc + v.stock, 0)
          : values.stock
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

          <div className="grid grid-cols-2 max-w-md gap-6 pt-4">
            <div className="space-y-2">
              <Label>Công khai</Label>
              <Controller
                control={control}
                name="isPublished"
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className="flex items-center gap-2"
                  >
                    {field.value ? (
                      <ToggleRight className="w-6 h-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                    <span>{field.value ? 'Đang hiển thị' : 'Đang ẩn'}</span>
                  </button>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Nổi bật</Label>
              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className="flex items-center gap-2"
                  >
                    {field.value ? (
                      <ToggleRight className="w-6 h-6 text-yellow-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                    <span>{field.value ? 'Nổi bật' : 'Không nổi bật'}</span>
                  </button>
                )}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* IMAGES */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Hình ảnh</h2>
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

      {/* PRICE & STOCK */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Giá & Tồn kho</h2>
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
            <Label>Giá gốc</Label>
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

        {/* Chỉ hiện tồn kho tổng nếu KHÔNG dùng variant */}
        {!hasVariants && (
          <div className="space-y-2 mt-6 max-w-xs">
            <Label>Tồn kho hiện tại</Label>
            <Input type="number" {...register('stock')} disabled />
          </div>
        )}
      </GlassCard>

      {/* 🟢 PHẦN MỚI: QUẢN LÝ BIẾN THỂ (VARIANTS) */}
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

          <Controller
            control={control}
            name="hasVariants"
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className="flex items-center gap-2"
              >
                {field.value ? (
                  <ToggleRight className="w-8 h-8 text-orange-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
                <span
                  className={
                    field.value
                      ? 'font-semibold text-orange-600'
                      : 'text-gray-500'
                  }
                >
                  {field.value ? 'Đang bật' : 'Chưa kích hoạt'}
                </span>
              </button>
            )}
          />
        </div>

        {hasVariants ? (
          <>
            <Controller
              control={control}
              name="variants" // Dummy controller để re-render khi variants đổi
              render={() => <></>}
            />
            <VariantManager
              // Kết nối React Hook Form với Component VariantManager
              groups={watch('variantGroups') || []}
              setGroups={(g) => setValue('variantGroups', g)}
              variants={watch('variants') || []}
              setVariants={(v) => setValue('variants', v)}
              basePrice={watch('price') || 0}
            />
          </>
        ) : (
          <div className="text-center py-8 text-gray-400 bg-gray-50/50 rounded-lg border border-dashed">
            Sản phẩm này không có biến thể.
          </div>
        )}
      </GlassCard>

      {/* 🟢 PHẦN MỚI: THÔNG SỐ KỸ THUẬT (SPECS) */}
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

        <SpecsManager
          specs={watch('specs') || []}
          setSpecs={(s) => setValue('specs', s)}
        />
      </GlassCard>

      {/* DESCRIPTION */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Mô tả chi tiết</h2>
        </div>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Editor value={field.value || ''} onChange={field.onChange} />
          )}
        />
      </GlassCard>

      {/* INVENTORY LOG */}
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

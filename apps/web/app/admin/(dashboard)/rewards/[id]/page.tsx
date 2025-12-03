'use client'

import { useEffect, use } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import api from '@/src/lib/api'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { toast } from 'sonner'
import GlassCard from '@/src/components/admin/GlassCard'
import { ToggleLeft, ToggleRight } from 'lucide-react'

export default function EditRewardPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const router = useRouter()

  const {
    handleSubmit,
    control,
    reset,
    watch,
    register,
    formState: { isSubmitting }
  } = useForm()

  const type = watch('type')

  // FETCH DATA
  const { data, isLoading } = useQuery({
    queryKey: ['reward', id],
    queryFn: async () => {
      const res = await api.get(`/admin/rewards/${id}`)
      return res.data.reward // API trả về { reward: ... }
    }
  })

  // RESET FORM
  useEffect(() => {
    if (data) {
      reset({
        ...data,
        codePrefix: data.codePrefix || '',
        description: data.description || '',
        pointsRequired: data.pointsRequired || 0,
        value: data.value || 0,
        minOrderValue: data.minOrderValue || 0,
        maxDiscountAmount: data.maxDiscountAmount || 0,
        stock: data.stock || 0,
        tierRequired: data.tierRequired || 'bronze',
        isActive: data.isActive
      })
    }
  }, [data, reset])

  // UPDATE MUTATION
  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await api.put(`/admin/rewards/${id}`, values)
      return res.data
    },
    onSuccess: () => {
      toast.success('Cập nhật quà tặng thành công!')
      queryClient.invalidateQueries({ queryKey: ['reward', id] })
      router.push('/admin/rewards')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Lỗi cập nhật!')
    }
  })

  if (isLoading) return <div className="p-6">Đang tải dữ liệu...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            Reward / Chỉnh sửa
          </div>
          <h1 className="text-2xl font-semibold mt-1">{data?.name}</h1>
        </div>
        <Button
          onClick={handleSubmit((d) => mutation.mutate(d))}
          disabled={isSubmitting || mutation.isPending}
        >
          {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>

      {/* CẤU HÌNH CHUNG */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Thông tin chung</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên quà tặng</Label>
              <Input {...register('name')} />
            </div>

            {/* 👇 INPUT PREFIX */}
            <div className="space-y-2">
              <Label>Mã định danh (Prefix)</Label>
              <Input
                {...register('codePrefix')}
                className="uppercase font-mono"
                placeholder="REWARD"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea {...register('description')} className="bg-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Điểm đổi</Label>
              <Input type="number" {...register('pointsRequired')} />
            </div>
            <div className="space-y-2">
              <Label>Tồn kho</Label>
              <Input type="number" {...register('stock')} />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <Label>Trạng thái</Label>
            <Controller
              control={control}
              name="isActive"
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
                  <span>{field.value ? 'Đang hoạt động' : 'Tạm ẩn'}</span>
                </button>
              )}
            />
          </div>
        </div>
      </GlassCard>

      {/* ĐIỀU KIỆN & GIÁ TRỊ */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Giá trị & Điều kiện</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Loại</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount_fixed">
                      Giảm tiền mặt
                    </SelectItem>
                    <SelectItem value="discount_percentage">Giảm %</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {type !== 'free_shipping' && (
            <div className="space-y-2">
              <Label>Giá trị</Label>
              <Input type="number" {...register('value')} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Đơn tối thiểu</Label>
            <Input type="number" {...register('minOrderValue')} />
          </div>

          {type === 'discount_percentage' && (
            <div className="space-y-2">
              <Label>Giảm tối đa</Label>
              <Input type="number" {...register('maxDiscountAmount')} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Hạng tối thiểu</Label>
            <Controller
              control={control}
              name="tierRequired"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

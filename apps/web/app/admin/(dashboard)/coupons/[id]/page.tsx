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
import { ToggleLeft, ToggleRight, Calendar } from 'lucide-react'

export default function EditCouponPage({
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

  const discountType = watch('discountType')

  // FETCH DATA
  const { data, isLoading } = useQuery({
    queryKey: ['coupon', id],
    queryFn: async () => {
      const res = await api.get(`/admin/coupons/${id}`)
      return res.data.coupon
    }
  })

  // RESET FORM
  useEffect(() => {
    if (data) {
      // Format dates cho input datetime-local
      const formatDateForInput = (date: string) => {
        const d = new Date(date)
        return d.toISOString().slice(0, 16)
      }

      reset({
        ...data,
        startDate: formatDateForInput(data.startDate),
        endDate: formatDateForInput(data.endDate),
        description: data.description || '',
        maxDiscountAmount: data.maxDiscountAmount || 0,
        minOrderAmount: data.minOrderAmount || 0,
        usageLimit: data.usageLimit || 0,
        usageLimitPerUser: data.usageLimitPerUser || 1
      })
    }
  }, [data, reset])

  // UPDATE MUTATION
  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await api.put(`/admin/coupons/${id}`, values)
      return res.data
    },
    onSuccess: () => {
      toast.success('Cập nhật mã giảm giá thành công!')
      queryClient.invalidateQueries({ queryKey: ['coupon', id] })
      router.push('/admin/coupons')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Lỗi cập nhật!')
    }
  })

  if (isLoading) return <div className="p-6">Đang tải dữ liệu...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            Coupon / Chỉnh sửa
          </div>
          <h1 className="text-2xl font-semibold mt-1 font-mono">
            {data?.code}
          </h1>
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
          <div className="space-y-2">
            <Label>Mã coupon (không thể sửa)</Label>
            <Input
              value={data?.code}
              disabled
              className="font-mono font-bold bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea
              {...register('description')}
              className="bg-transparent"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Áp dụng cho</Label>
            <Controller
              control={control}
              name="customerType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả khách hàng</SelectItem>
                    <SelectItem value="new">Chỉ khách hàng mới</SelectItem>
                    <SelectItem value="existing">Chỉ khách hàng cũ</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Tự động áp dụng</Label>
            <Controller
              control={control}
              name="autoApply"
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
                  <span className="text-sm">
                    {field.value
                      ? 'Tự động áp dụng khi đủ điều kiện'
                      : 'Khách hàng phải nhập mã thủ công'}
                  </span>
                </button>
              )}
            />
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại</Label>
              <Controller
                control={control}
                name="discountType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Giảm %</SelectItem>
                      <SelectItem value="fixed">Giảm tiền mặt</SelectItem>
                      <SelectItem value="free_shipping">
                        Miễn phí ship
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {discountType !== 'free_shipping' && (
              <div className="space-y-2">
                <Label>Giá trị</Label>
                <Input type="number" {...register('discountValue')} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discountType === 'percentage' && (
              <div className="space-y-2">
                <Label>Giảm tối đa (VNĐ)</Label>
                <Input type="number" {...register('maxDiscountAmount')} />
              </div>
            )}

            <div className="space-y-2">
              <Label>Đơn tối thiểu (VNĐ)</Label>
              <Input type="number" {...register('minOrderAmount')} />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* GIỚI HẠN SỬ DỤNG */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Giới hạn sử dụng</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tổng số lần sử dụng</Label>
            <Input type="number" {...register('usageLimit')} />
            <p className="text-xs text-muted-foreground">
              Đã dùng: <span className="font-bold">{data?.usedCount || 0}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Số lần dùng / khách hàng</Label>
            <Input type="number" {...register('usageLimitPerUser')} min={1} />
          </div>
        </div>
      </GlassCard>

      {/* THỜI GIAN */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Thời gian có hiệu lực
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ngày bắt đầu</Label>
            <Input type="datetime-local" {...register('startDate')} />
          </div>

          <div className="space-y-2">
            <Label>Ngày kết thúc</Label>
            <Input type="datetime-local" {...register('endDate')} />
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

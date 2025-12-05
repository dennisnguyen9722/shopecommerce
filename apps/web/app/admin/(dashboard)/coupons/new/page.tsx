'use client'

import { useState } from 'react'
import api from '@/src/lib/api'
import { useMutation } from '@tanstack/react-query'
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
import { Textarea } from '@/components/ui/textarea'
import GlassCard from '@/src/components/admin/GlassCard'
import { ToggleLeft, ToggleRight, Calendar } from 'lucide-react'

export default function CreateCouponPage() {
  const router = useRouter()

  // STATE
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(0)
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0)
  const [usageLimit, setUsageLimit] = useState<number>(0)
  const [usageLimitPerUser, setUsageLimitPerUser] = useState<number>(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [customerType, setCustomerType] = useState('all')
  const [autoApply, setAutoApply] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const mut = useMutation({
    mutationFn: async () => {
      const res = await api.post('/admin/coupons', {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        maxDiscountAmount:
          discountType === 'percentage' ? maxDiscountAmount : undefined,
        minOrderAmount: minOrderAmount || undefined,
        usageLimit: usageLimit || undefined,
        usageLimitPerUser,
        startDate,
        endDate,
        customerType,
        autoApply,
        isActive
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Tạo mã giảm giá thành công!')
      router.push('/admin/coupons')
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Lỗi khi tạo mã giảm giá!')
    }
  })

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Coupon / Tạo mới</div>
          <h1 className="text-2xl font-semibold mt-1">Tạo mã giảm giá mới</h1>
        </div>

        <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
          {mut.isPending ? 'Đang tạo...' : 'Lưu lại'}
        </Button>
      </div>

      {/* CẤU HÌNH CƠ BẢN */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Mã coupon <span className="text-red-500">*</span>
              </Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: SALE50, NEWUSER"
                className="font-mono uppercase font-bold"
                required
              />
              <p className="text-xs text-muted-foreground">
                Khách hàng sẽ nhập mã này khi thanh toán
              </p>
            </div>

            <div className="space-y-2">
              <Label>Áp dụng cho</Label>
              <Select value={customerType} onValueChange={setCustomerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khách hàng</SelectItem>
                  <SelectItem value="new">Chỉ khách hàng mới</SelectItem>
                  <SelectItem value="existing">Chỉ khách hàng cũ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Mô tả <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả điều kiện áp dụng mã giảm giá..."
              className="bg-transparent border-gray-200"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tự động áp dụng</Label>
            <button
              type="button"
              onClick={() => setAutoApply(!autoApply)}
              className="flex items-center gap-2"
            >
              {autoApply ? (
                <ToggleRight className="w-6 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
              <span className="text-sm">
                {autoApply
                  ? 'Tự động áp dụng khi đủ điều kiện'
                  : 'Khách hàng phải nhập mã thủ công'}
              </span>
            </button>
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className="flex items-center gap-2"
            >
              {isActive ? (
                <ToggleRight className="w-6 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
              <span>{isActive ? 'Đang hoạt động' : 'Tạm ẩn'}</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* CẤU HÌNH GIÁ TRỊ */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Giá trị giảm giá</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại giảm giá</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    Giảm theo phần trăm (%)
                  </SelectItem>
                  <SelectItem value="fixed">Giảm tiền mặt (VNĐ)</SelectItem>
                  <SelectItem value="free_shipping">
                    Miễn phí vận chuyển
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {discountType !== 'free_shipping' && (
              <div className="space-y-2">
                <Label>
                  Giá trị {discountType === 'percentage' ? '(%)' : '(VNĐ)'}
                </Label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder={discountType === 'percentage' ? '10' : '50000'}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discountType === 'percentage' && (
              <div className="space-y-2">
                <Label>Giảm tối đa (VNĐ)</Label>
                <Input
                  type="number"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                  placeholder="100000"
                />
                <p className="text-xs text-muted-foreground">
                  Giới hạn số tiền giảm tối đa (0 = không giới hạn)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Đơn hàng tối thiểu (VNĐ)</Label>
              <Input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">0 = Không yêu cầu</p>
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
            <Input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(Number(e.target.value))}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">0 = Không giới hạn</p>
          </div>

          <div className="space-y-2">
            <Label>Số lần dùng / khách hàng</Label>
            <Input
              type="number"
              value={usageLimitPerUser}
              onChange={(e) => setUsageLimitPerUser(Number(e.target.value))}
              placeholder="1"
              min={1}
            />
            <p className="text-xs text-muted-foreground">
              Mỗi khách hàng có thể dùng bao nhiêu lần
            </p>
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
            <Label>
              Ngày bắt đầu <span className="text-red-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              Ngày kết thúc <span className="text-red-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

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
import { Textarea } from '@/components/ui/textarea' // Nhớ check xem có component này chưa, nếu chưa dùng <textarea className... />
import GlassCard from '@/src/components/admin/GlassCard'
import { ToggleLeft, ToggleRight } from 'lucide-react'

export default function CreateRewardPage() {
  const router = useRouter()

  // STATE
  const [name, setName] = useState('')
  const [codePrefix, setCodePrefix] = useState('')
  const [description, setDescription] = useState('')
  const [pointsRequired, setPointsRequired] = useState<number>(0)
  const [type, setType] = useState('discount_fixed')
  const [value, setValue] = useState<number>(0)
  const [minOrderValue, setMinOrderValue] = useState<number>(0)
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(0)
  const [tierRequired, setTierRequired] = useState('bronze')
  const [stock, setStock] = useState<number>(1000)
  const [isActive, setIsActive] = useState(true)

  const mut = useMutation({
    mutationFn: async () => {
      const res = await api.post('/admin/rewards', {
        name,
        codePrefix: codePrefix || 'REWARD',
        description,
        pointsRequired,
        type,
        value,
        minOrderValue,
        maxDiscountAmount:
          type === 'discount_percentage' ? maxDiscountAmount : undefined,
        tierRequired,
        stock,
        isActive
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Tạo quà tặng thành công!')
      router.push('/admin/rewards')
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Lỗi khi tạo quà tặng!')
    }
  })

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Reward / Tạo mới</div>
          <h1 className="text-2xl font-semibold mt-1">Tạo quà tặng mới</h1>
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
                Tên quà tặng <span className="text-red-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Voucher giảm 50k"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Mã định danh (Prefix)</Label>
              <Input
                value={codePrefix}
                onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
                placeholder="VD: SALE50"
                className="font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Mã sẽ có dạng: SALE50-XXXXXX
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Mô tả ngắn <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả điều kiện áp dụng..."
              className="bg-transparent border-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Điểm đổi cần thiết</Label>
              <Input
                type="number"
                value={pointsRequired}
                onChange={(e) => setPointsRequired(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Số lượng tồn (Stock)</Label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>
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
          <h2 className="text-lg font-semibold">Giá trị & Điều kiện</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="space-y-2">
            <Label>Loại ưu đãi</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount_fixed">
                  Giảm tiền mặt (Fixed)
                </SelectItem>
                <SelectItem value="discount_percentage">
                  Giảm theo phần trăm (%)
                </SelectItem>
                <SelectItem value="free_shipping">
                  Miễn phí vận chuyển
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type !== 'free_shipping' && (
            <div className="space-y-2">
              <Label>
                Giá trị {type === 'discount_percentage' ? '(%)' : '(VNĐ)'}
              </Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                placeholder={type === 'discount_percentage' ? '10' : '50000'}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Đơn tối thiểu (VNĐ)</Label>
            <Input
              type="number"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">0 = Không yêu cầu</p>
          </div>

          {type === 'discount_percentage' && (
            <div className="space-y-2">
              <Label>Giảm tối đa (VNĐ)</Label>
              <Input
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Giới hạn số tiền giảm tối đa
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Hạng thành viên tối thiểu</Label>
            <Select value={tierRequired} onValueChange={setTierRequired}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bronze">Bronze (Tất cả)</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

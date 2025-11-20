'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import api from '@/src/lib/api'

type AdjustStockProps = {
  productId: string
  currentStock: number
  onUpdated: (newStock: number) => void
}

export default function AdjustStock({
  productId,
  currentStock,
  onUpdated
}: AdjustStockProps) {
  const [change, setChange] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const diff = Number(change)

    if (!change || Number.isNaN(diff) || diff === 0) {
      toast.error('Vui lòng nhập số lượng thay đổi (ví dụ: 10 hoặc -3)')
      return
    }

    try {
      setIsSubmitting(true)

      const res = await api.post(`/admin/products/${productId}/adjust-stock`, {
        change: diff,
        note
      })

      const newStock = res.data.stock
      toast.success('Cập nhật tồn kho thành công!')

      onUpdated(newStock)
      setChange('')
      setNote('')
    } catch (err: any) {
      console.error(err)
      toast.error('Cập nhật tồn kho thất bại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Tồn kho hiện tại:{' '}
        <span className="font-semibold text-blue-600">{currentStock}</span>
      </div>

      <div className="space-y-2">
        <Label>Thay đổi số lượng</Label>
        <Input
          type="number"
          placeholder="Ví dụ: 10 hoặc -3"
          value={change}
          onChange={(e) => setChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Ghi chú (không bắt buộc)</Label>
        <Input
          placeholder="Ví dụ: Nhập thêm hàng, chỉnh tồn kho, v.v."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật tồn kho'}
      </Button>
    </div>
  )
}

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import api from '@/src/lib/api'

type Props = {
  productId: string
  currentStock: number
  open: boolean
  setOpen: (v: boolean) => void
  onUpdated: (newStock: number) => void
}

export default function AdjustStockModal({
  productId,
  currentStock,
  open,
  setOpen,
  onUpdated
}: Props) {
  const [change, setChange] = useState('')
  const [note, setNote] = useState('')
  const [type, setType] = useState<'import' | 'adjust' | 'return'>('adjust')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    const diff = Number(change)

    if (!change || Number.isNaN(diff) || diff === 0) {
      toast.error('Nhập số lượng (ví dụ: 10 hoặc -3)')
      return
    }

    try {
      setLoading(true)

      const res = await api.post(`/admin/products/${productId}/adjust-stock`, {
        change: diff,
        note,
        type
      })

      onUpdated(res.data.stock)
      toast.success('Cập nhật tồn kho thành công!')
      setOpen(false)

      setChange('')
      setNote('')
    } catch (err) {
      console.error(err)
      toast.error('Không thể cập nhật tồn kho.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
        </DialogHeader>

        {/* Current stock */}
        <div className="mb-4 text-sm text-gray-600">
          Tồn kho hiện tại:{' '}
          <span className="font-semibold text-blue-600">{currentStock}</span>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label>Loại điều chỉnh</Label>
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="import">Nhập hàng</SelectItem>
              <SelectItem value="adjust">Điều chỉnh thủ công</SelectItem>
              <SelectItem value="return">Hoàn hàng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Change amount */}
        <div className="space-y-2 mt-4">
          <Label>Số lượng thay đổi</Label>
          <Input
            type="number"
            placeholder="VD: 10 hoặc -3"
            value={change}
            onChange={(e) => setChange(e.target.value)}
          />
        </div>

        {/* Note */}
        <div className="space-y-2 mt-4">
          <Label>Ghi chú</Label>
          <Input
            placeholder="VD: Nhập thêm hàng, chỉnh sai stock..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

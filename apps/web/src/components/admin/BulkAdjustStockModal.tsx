'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'

import api from '@/src/lib/api'
import { toast } from 'sonner'

export default function BulkAdjustStockModal({
  open,
  setOpen,
  productIds,
  onSuccess
}: {
  open: boolean
  setOpen: (v: boolean) => void
  productIds: string[]
  onSuccess: () => void
}) {
  const [change, setChange] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    const diff = Number(change)
    if (Number.isNaN(diff) || diff === 0) {
      toast.error('Vui lòng nhập số lượng thay đổi hợp lệ')
      return
    }

    try {
      setLoading(true)

      await api.post('/admin/inventory/bulk-adjust', {
        ids: productIds,
        change: diff,
        note
      })

      toast.success('Điều chỉnh tồn kho hàng loạt thành công')
      setOpen(false)
      setChange('')
      setNote('')
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('Thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Điều chỉnh tồn kho hàng loạt</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="text-sm text-gray-600">
            Số sản phẩm đã chọn: <strong>{productIds.length}</strong>
          </div>

          <Input
            type="number"
            placeholder="Ví dụ: 10 hoặc -5"
            value={change}
            onChange={(e) => setChange(e.target.value)}
          />

          <Input
            placeholder="Ghi chú (không bắt buộc)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Huỷ
          </Button>

          <Button onClick={submit} disabled={loading}>
            {loading ? 'Đang xử lý…' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

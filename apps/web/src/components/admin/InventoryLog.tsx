'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { Badge } from '@/components/ui/badge'
import GlassCard from '@/src/components/admin/GlassCard'

type LogItem = {
  _id: string
  change: number
  oldStock: number
  newStock: number
  type: 'import' | 'adjust' | 'order' | 'return'
  note?: string
  createdAt: string
  admin?: { name?: string; email?: string }
}

export default function InventoryLog({ productId }: { productId: string }) {
  const { data, isLoading } = useQuery<{ items: LogItem[] }>({
    queryKey: ['stock-logs', productId],
    queryFn: async () => {
      const res = await api.get(`/admin/products/${productId}/stock-logs`)
      return res.data
    }
  })

  if (isLoading) return <div className="p-4">Đang tải lịch sử...</div>

  const items = data?.items ?? []

  const typeLabel = (type: string) => {
    switch (type) {
      case 'import':
        return 'Nhập kho'
      case 'adjust':
        return 'Điều chỉnh'
      case 'order':
        return 'Trừ khi đặt hàng'
      case 'return':
        return 'Trả hàng'
      default:
        return type
    }
  }

  const typeStyle = (type: string) => {
    switch (type) {
      case 'import':
        return 'bg-green-100 text-green-700'
      case 'adjust':
        return 'bg-blue-100 text-blue-700'
      case 'order':
        return 'bg-red-100 text-red-700'
      case 'return':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  }

  return (
    <GlassCard>
      {/* Header */}
      <div className="border-b border-white/20 pb-4 mb-4">
        <h2 className="text-lg font-semibold">Lịch sử tồn kho</h2>
        <p className="text-sm text-muted-foreground">
          Theo dõi tất cả thay đổi tồn kho của sản phẩm này.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thay đổi</TableHead>
            <TableHead>Trước → Sau</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Thời gian</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((log) => (
            <TableRow key={log._id} className="hover:bg-white/40 transition">
              <TableCell>
                <span
                  className={
                    log.change > 0
                      ? 'text-green-600 font-semibold'
                      : 'text-red-600 font-semibold'
                  }
                >
                  {log.change > 0 ? `+${log.change}` : log.change}
                </span>
              </TableCell>

              <TableCell>
                {log.oldStock} →{' '}
                <span className="font-semibold">{log.newStock}</span>
              </TableCell>

              <TableCell>
                <Badge className={typeStyle(log.type)}>
                  {typeLabel(log.type)}
                </Badge>
              </TableCell>

              <TableCell className="max-w-[260px] truncate">
                {log.note || '—'}
              </TableCell>

              <TableCell>
                {log.admin?.name || log.admin?.email || '—'}
              </TableCell>

              <TableCell>
                {new Date(log.createdAt).toLocaleString('vi-VN')}
              </TableCell>
            </TableRow>
          ))}

          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-6 text-muted-foreground"
              >
                Chưa có lịch sử thay đổi tồn kho.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </GlassCard>
  )
}

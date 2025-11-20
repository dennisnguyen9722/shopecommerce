'use client'
import InvoicePDF from '@/src/components/admin/InvoicePDF'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useOrderDetail } from '@/src/hooks/useOrderDetail'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import dynamic from 'next/dynamic'

interface Props {
  orderId: string | null
  onClose: () => void
}

export default function OrderDetailDialog({ orderId, onClose }: Props) {
  const { data, isLoading } = useOrderDetail(orderId || undefined)

  const InvoicePDFClient = dynamic(
    () => import('@/src/components/admin/InvoicePDF.client'),
    { ssr: false }
  )

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print()
  }

  if (!orderId) return null

  return (
    <Dialog open={!!orderId} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng #{orderId?.slice(-5)}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <p>Đang tải chi tiết đơn hàng...</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 text-sm gap-2">
              <div>
                <p>
                  <strong>Khách hàng:</strong> {data?.customer?.name}
                </p>
                <p>
                  <strong>Email:</strong> {data?.customer?.email}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {data?.customer?.address}
                </p>
              </div>
              <div>
                <p>
                  <strong>Ngày tạo:</strong>{' '}
                  {format(new Date(data?.createdAt), 'dd/MM/yyyy HH:mm', {
                    locale: vi
                  })}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {data?.status}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Sản phẩm</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Tổng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items?.map((item: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.price.toLocaleString('vi-VN')}₫
                      </TableCell>
                      <TableCell>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <p className="font-semibold">
                Tổng tiền:{' '}
                {data?.items
                  ?.reduce(
                    (sum: number, i: any) => sum + i.price * i.quantity,
                    0
                  )
                  .toLocaleString('vi-VN')}
                ₫
              </p>
            </div>
          </div>
        )}
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <InvoicePDFClient order={data} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

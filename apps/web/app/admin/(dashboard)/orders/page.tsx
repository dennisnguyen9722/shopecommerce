'use client'

import { useState } from 'react'
import OrderDetailDialog from '@/src/components/admin/OrderDetailDialog'
import InvoicePDFClient from '@/src/components/admin/InvoicePDF.client'
import { useOrders } from '@/src/hooks/useOrders'
import GlassCard from '@/src/components/admin/GlassCard'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

// ===============================================
// UTILS
// ===============================================
const formatCurrency = (n: number | undefined) => {
  if (typeof n !== 'number') return '0'
  return n.toLocaleString('vi-VN') + ' ₫'
}

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'N/A'
  }
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    processing: 'bg-blue-100 text-blue-800 border-blue-300',
    shipped: 'bg-purple-100 text-purple-800 border-purple-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

// ===============================================
// MAIN COMPONENT
// ===============================================
export default function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch orders
  const { data: orders, isLoading } = useOrders('all')

  // Client-side filtering
  const filteredOrders = (orders || []).filter((order: any) => {
    const matchSearch =
      !search ||
      order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone?.includes(search) ||
      order._id?.includes(search)

    const matchStatus = statusFilter === 'all' || order.status === statusFilter

    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Đơn hàng</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tất cả đơn hàng khách đặt.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <GlassCard className="py-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <Input
            type="text"
            placeholder="Tìm theo tên khách, SĐT, mã đơn..."
            className="w-full md:w-80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="processing">Đang xử lý</SelectItem>
              <SelectItem value="shipped">Đang giao</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* TABLE */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Danh sách đơn hàng</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Đang tải đơn hàng...
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>SP</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredOrders.map((order: any) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <span className="font-mono text-sm text-gray-600">
                        #{order._id?.slice(-6) || 'N/A'}
                      </span>
                    </TableCell>

                    <TableCell className="font-medium">
                      {order.customerName || 'N/A'}
                    </TableCell>

                    <TableCell className="text-sm text-gray-600">
                      {order.customerPhone || 'N/A'}
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs line-clamp-2 text-sm text-gray-600">
                        {order.customerAddress || 'N/A'}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-gray-600">
                      {order.items?.length || 0} SP
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-orange-600">
                        {formatCurrency(order.totalPrice)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status || 'pending'
                        )}`}
                      >
                        {getStatusLabel(order.status || 'pending')}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrderId(order._id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </Button>

                        <InvoicePDFClient order={order} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="text-gray-500">
                        <p className="text-lg font-medium">
                          {search || statusFilter !== 'all'
                            ? 'Không tìm thấy đơn hàng'
                            : 'Chưa có đơn hàng nào'}
                        </p>
                        <p className="text-sm mt-1">
                          {search || statusFilter !== 'all'
                            ? 'Thử thay đổi bộ lọc'
                            : 'Đơn hàng từ khách hàng sẽ xuất hiện ở đây'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* STATS */}
            {filteredOrders.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="text-sm text-gray-600">
                  Hiển thị {filteredOrders.length} đơn hàng
                  {(search || statusFilter !== 'all') &&
                    ` (đã lọc từ ${orders?.length || 0} tổng)`}
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>

      {/* ORDER DETAIL DIALOG */}
      <OrderDetailDialog
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  )
}

'use client'

import { useMemo, useState, useEffect } from 'react'
import { useOrders, useUpdateOrderStatus } from '@/src/hooks/useOrders'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Loader2, MoreHorizontal, Eye, Download } from 'lucide-react'
import OrderDetailDialog from '@/src/components/admin/OrderDetailDialog'
import GlassCard from '@/src/components/admin/GlassCard'

/* Debounce Helper */
function useDebounce(value: any, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value])
  return debounced
}

/* Gradient Status Badge */
function StatusBadge({ status }: { status: string }) {
  const map: any = {
    pending: 'bg-yellow-200/40 text-yellow-800 border border-yellow-300/40',
    processing: 'bg-blue-200/40 text-blue-800 border border-blue-300/40',
    completed: 'bg-green-200/40 text-green-800 border border-green-300/40',
    cancelled: 'bg-red-200/40 text-red-800 border border-red-300/40'
  }
  return <Badge className={map[status]}>{status}</Badge>
}

export default function OrdersTable() {
  // Filters
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Sort
  const [sort, setSort] = useState<
    'newest' | 'oldest' | 'price-asc' | 'price-desc'
  >('newest')

  // Pagination
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Load data
  const { data, isLoading } = useOrders(status)
  const updateStatus = useUpdateOrderStatus()

  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const orders = data || []

  const STATUS_MAP = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'processing', label: 'Đang giao' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' }
  ]

  /* Client-side Filter */
  const filteredOrders = useMemo(() => {
    return orders.filter((o: any) => {
      const code = `#${o._id.slice(-5)}`.toLowerCase()
      const name = (o.customer?.name || '').toLowerCase()
      const q = debouncedSearch.toLowerCase()

      if (q && !code.includes(q) && !name.includes(q)) return false

      if (dateFrom) {
        if (new Date(o.createdAt) < new Date(dateFrom)) return false
      }
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        if (new Date(o.createdAt) > end) return false
      }

      if (minPrice && o.total < +minPrice) return false
      if (maxPrice && o.total > +maxPrice) return false

      return true
    })
  }, [orders, debouncedSearch, dateFrom, dateTo, minPrice, maxPrice])

  /* Sort */
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      if (sort === 'newest')
        return +new Date(b.createdAt) - +new Date(a.createdAt)
      if (sort === 'oldest')
        return +new Date(a.createdAt) - +new Date(b.createdAt)
      if (sort === 'price-asc') return a.total - b.total
      if (sort === 'price-desc') return b.total - a.total
      return 0
    })
  }, [filteredOrders, sort])

  /* Pagination */
  const total = sortedOrders.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const paginated = sortedOrders.slice((page - 1) * pageSize, page * pageSize)

  /* Summary total money */
  const totalAmount = filteredOrders.reduce(
    (s: number, o: any) => s + o.total,
    0
  )

  /* CSV Export */
  function exportCSV() {
    const rows = [
      ['OrderID', 'Customer', 'Total', 'Status', 'CreatedAt'],
      ...sortedOrders.map((o: any) => [
        o._id,
        o.customer?.name || 'N/A',
        o.total,
        o.status,
        o.createdAt
      ])
    ]

    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'orders.csv'
    a.click()
  }
  const formatCurrency = (n: number) => n.toLocaleString('vi-VN') + '₫'

  return (
    <div className="space-y-6">
      {/* FILTER BAR (Glass) */}
      <GlassCard className="space-y-4 p-4">
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Status Buttons */}

          <div className="flex gap-2 flex-wrap">
            {STATUS_MAP.map((s) => (
              <Button
                key={s.key}
                variant={status === s.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatus(s.key)
                  setPage(1)
                }}
              >
                {s.label}
              </Button>
            ))}
          </div>

          {/* Search + Dates + Price */}
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Tìm theo mã đơn / tên khách..."
              className="w-60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Date From */}
            <div className="relative">
              <Input
                type="date"
                className="w-36 pr-8"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              {dateFrom && (
                <button
                  onClick={() => setDateFrom('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Date To */}
            <div className="relative">
              <Input
                type="date"
                className="w-36 pr-8"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              {dateTo && (
                <button
                  onClick={() => setDateTo('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  ✕
                </button>
              )}
            </div>

            <Input
              placeholder="Min ₫"
              className="w-28"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />

            <Input
              placeholder="Max ₫"
              className="w-28"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />

            <Button variant="secondary" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-1" /> CSV
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="pt-3 mt-2 border-t border-white/30 text-sm text-muted-foreground flex justify-between">
          <div>
            Hiển thị {paginated.length}/{total} đơn hàng
          </div>
          <div>
            Tổng tiền:{' '}
            <span className="font-medium text-foreground">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* TABLE */}
      <GlassCard>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center">
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  Đang tải...
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              paginated.map((o: any) => (
                <TableRow key={o._id} className="hover:bg-white/30 transition">
                  <TableCell>#{o._id.slice(-5)}</TableCell>
                  <TableCell>{o.customer?.name ?? 'Ẩn danh'}</TableCell>
                  <TableCell>{formatCurrency(o.total)}</TableCell>
                  <TableCell>
                    {format(new Date(o.createdAt), 'dd/MM/yyyy', {
                      locale: vi
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setSelectedOrder(o._id)}
                        >
                          <Eye className="w-4 h-4 text-blue-500" /> Xem chi tiết
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuLabel className="text-xs">
                          Cập nhật trạng thái
                        </DropdownMenuLabel>

                        {[
                          { key: 'pending', label: 'Chờ xử lý', icon: '🟡' },
                          { key: 'processing', label: 'Đang giao', icon: '🔵' },
                          { key: 'completed', label: 'Hoàn thành', icon: '🟢' },
                          { key: 'cancelled', label: 'Đã hủy', icon: '🔴' }
                        ].map((s) => (
                          <DropdownMenuItem
                            key={s.key}
                            onClick={() =>
                              updateStatus.mutate({ id: o._id, status: s.key })
                            }
                          >
                            <span>{s.icon}</span>
                            {s.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center">
                  Không có đơn hàng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        {total > 0 && (
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <div>
              Trang {page}/{totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹ Trước
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau ›
              </Button>
            </div>
          </div>
        )}

        <OrderDetailDialog
          orderId={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      </GlassCard>
    </div>
  )
}

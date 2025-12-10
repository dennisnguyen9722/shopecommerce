/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import api from '@/src/lib/api'
import dynamic from 'next/dynamic'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import GlassCard from '@/src/components/admin/GlassCard'
import OrderDetailDialog from '@/src/components/admin/OrderDetailDialog'

// Load PDF component dynamic để tránh lỗi SSR
const InvoicePDFClient = dynamic(
  () => import('@/src/components/admin/InvoicePDF.client'),
  { ssr: false }
)

// --- UTILS ---
const formatCurrency = (n: number | undefined) => {
  if (typeof n !== 'number') return '-'
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
    pending:
      'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-300',
    processing:
      'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300',
    shipped:
      'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300',
    completed:
      'bg-green-100 text-green-800 border-green-300 dark:bg-green-500/20 dark:text-green-300',
    cancelled:
      'bg-red-100 text-red-800 border-red-300 dark:bg-red-500/20 dark:text-red-300'
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

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [selected, setSelected] = useState<string[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const pageSize = 10

  useEffect(() => {
    const orderIdFromUrl = searchParams.get('orderId')
    if (orderIdFromUrl) {
      setSelectedOrderId(orderIdFromUrl)
    }
  }, [searchParams])

  const handleCloseDialog = () => {
    setSelectedOrderId(null)
    router.replace('/admin/orders', { scroll: false })
    refetch()
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-orders', search, statusFilter, sort, page],
    queryFn: async () => {
      const res = await api.get('/admin/orders')
      const rawData = res.data
      let allItems: any[] = []

      if (Array.isArray(rawData)) {
        allItems = rawData
      } else if (rawData && Array.isArray(rawData.orders)) {
        allItems = rawData.orders
      } else {
        allItems = []
      }

      if (search) {
        const lowerSearch = search.toLowerCase()
        allItems = allItems.filter(
          (o: any) =>
            o.customerName?.toLowerCase().includes(lowerSearch) ||
            o.customerPhone?.includes(lowerSearch) ||
            o._id?.includes(lowerSearch)
        )
      }

      if (statusFilter !== 'all') {
        allItems = allItems.filter((o: any) => o.status === statusFilter)
      }

      if (sort === 'newest') {
        allItems.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      } else if (sort === 'oldest') {
        allItems.sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      } else if (sort === 'total-desc') {
        allItems.sort(
          (a: any, b: any) => (b.totalPrice || 0) - (a.totalPrice || 0)
        )
      } else if (sort === 'total-asc') {
        allItems.sort(
          (a: any, b: any) => (a.totalPrice || 0) - (b.totalPrice || 0)
        )
      }

      const total = allItems.length
      const totalPages = Math.ceil(total / pageSize)
      const offset = (page - 1) * pageSize
      const paginatedItems = allItems.slice(offset, offset + pageSize)

      return {
        items: paginatedItems,
        pagination: { page, pages: totalPages || 1, total }
      }
    }
  })

  if (isLoading)
    return <div className="p-6">Đang tải danh sách đơn hàng...</div>
  if (isError)
    return <div className="p-6 text-red-600">Lỗi tải danh sách đơn hàng.</div>

  const items = data?.items || []
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 }

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selected.length === items.length) setSelected([])
    else setSelected(items.map((x: any) => x._id))
  }

  return (
    // FIX: overflow-hidden để tránh body scroll
    <div className="p-4 md:p-6 space-y-6 w-full max-w-[100vw] overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Đơn hàng
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quản lý và xử lý đơn đặt hàng từ khách
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm tên khách, SĐT, mã đơn..."
              className="pl-9 bg-white dark:bg-gray-900/50"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2 lg:gap-4">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setPage(1)
                setStatusFilter(v)
              }}
            >
              <SelectTrigger className="w-full lg:w-40 bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="shipped">Đang giao</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(v) => {
                setPage(1)
                setSort(v)
              }}
            >
              <SelectTrigger className="w-full lg:w-40 bg-white dark:bg-gray-900/50">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="total-desc">Giá trị cao → thấp</SelectItem>
                <SelectItem value="total-asc">Giá trị thấp → cao</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {/* TABLE */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Danh sách đơn hàng</h2>
          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            Total: {pagination.total}
          </span>
        </div>

        {/* ⭐ FIX QUAN TRỌNG: Scroll ngang + Min width */}
        <div className="w-full overflow-x-auto pb-2">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
              <TableRow>
                <TableHead className="w-[40px]">
                  <input
                    type="checkbox"
                    checked={
                      selected.length === items.length && items.length > 0
                    }
                    onChange={selectAll}
                    className="rounded border-gray-400 text-orange-600 focus:ring-orange-500"
                  />
                </TableHead>
                <TableHead className="w-[100px]">Mã đơn</TableHead>
                <TableHead className="w-[200px]">Khách hàng</TableHead>
                <TableHead className="w-[250px]">Địa chỉ</TableHead>
                <TableHead className="w-[60px] text-center">SP</TableHead>
                <TableHead className="w-[120px]">Tổng tiền</TableHead>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
                <TableHead className="w-[140px]">Ngày đặt</TableHead>
                {/* STICKY COLUMN */}
                <TableHead className="w-[100px] text-right sticky right-0 z-10 bg-gray-50 dark:bg-gray-900/50">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((order: any) => (
                <TableRow
                  key={order._id}
                  className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${
                    selected.includes(order._id)
                      ? 'bg-orange-50 dark:bg-orange-900/20'
                      : ''
                  }`}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(order._id)}
                      onChange={() => toggleSelect(order._id)}
                      className="rounded border-gray-400 text-orange-600 focus:ring-orange-500"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border">
                      #{order._id?.slice(-6).toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-[180px]">
                      <span
                        className="font-medium text-sm truncate"
                        title={order.customerName}
                      >
                        {order.customerName}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {order.customerPhone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="max-w-[240px] truncate text-sm text-gray-600 dark:text-gray-300"
                      title={order.customerAddress}
                    >
                      {order.customerAddress || '—'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {order.items?.length || 0}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-orange-600 text-sm">
                      {formatCurrency(order.totalPrice)}
                    </span>
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
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </TableCell>

                  {/* STICKY ACTIONS */}
                  <TableCell className="text-right sticky right-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-l dark:border-gray-800">
                    <div className="flex items-center justify-end gap-2">
                      {/* PDF Button */}
                      <InvoicePDFClient order={order} />

                      {/* View Detail */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => setSelectedOrderId(order._id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-12 text-muted-foreground"
                  >
                    {isLoading
                      ? 'Đang tải...'
                      : 'Không có đơn hàng nào khớp bộ lọc.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50/50">
          <div className="text-xs text-muted-foreground">
            Trang {pagination.page}/{pagination.pages} · Tổng {pagination.total}{' '}
            đơn
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹ Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            >
              Sau ›
            </Button>
          </div>
        </div>
      </GlassCard>

      <OrderDetailDialog
        orderId={selectedOrderId}
        onClose={handleCloseDialog}
      />
    </div>
  )
}

/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation' // 👈 Import Router & SearchParams
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

// Dynamic import PDF để tránh lỗi SSR
const InvoicePDFClient = dynamic(
  () => import('@/src/components/admin/InvoicePDF.client'),
  { ssr: false }
)

// ===============================================
// UTILS
// ===============================================
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

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams() // 👈 Hook lấy param từ URL

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('newest')

  // State chọn nhiều (Bulk Select)
  const [selected, setSelected] = useState<string[]>([])

  // Dialog State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const pageSize = 10

  // ===============================================
  // 1. AUTO OPEN MODAL FROM URL (Logic mới)
  // ===============================================
  useEffect(() => {
    const orderIdFromUrl = searchParams.get('orderId')
    if (orderIdFromUrl) {
      setSelectedOrderId(orderIdFromUrl)
    }
  }, [searchParams])

  // Hàm đóng dialog chuẩn: Xóa ID trên URL + Refetch data
  const handleCloseDialog = () => {
    setSelectedOrderId(null)
    // Xóa query param để URL sạch sẽ (không reload trang)
    router.replace('/admin/orders', { scroll: false })
    refetch()
  }

  // ===============================================
  // 2. FETCH ORDERS (REACT QUERY)
  // ===============================================
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-orders', search, statusFilter, sort, page],
    queryFn: async () => {
      const res = await api.get('/admin/orders')
      const rawData = res.data

      // 👇 FIX LỖI DATA (Mảng vs Object)
      let allItems: any[] = []

      if (Array.isArray(rawData)) {
        allItems = rawData
      } else if (rawData && Array.isArray(rawData.orders)) {
        allItems = rawData.orders
      } else {
        console.warn('⚠️ API trả về định dạng lạ:', rawData)
        allItems = []
      }

      // 1. Filter Search
      if (search) {
        const lowerSearch = search.toLowerCase()
        allItems = allItems.filter(
          (o: any) =>
            o.customerName?.toLowerCase().includes(lowerSearch) ||
            o.customerPhone?.includes(lowerSearch) ||
            o._id?.includes(lowerSearch)
        )
      }

      // 2. Filter Status
      if (statusFilter !== 'all') {
        allItems = allItems.filter((o: any) => o.status === statusFilter)
      }

      // 3. Sort
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

      // 4. Pagination
      const total = allItems.length
      const totalPages = Math.ceil(total / pageSize)
      const offset = (page - 1) * pageSize
      const paginatedItems = allItems.slice(offset, offset + pageSize)

      return {
        items: paginatedItems,
        pagination: {
          page,
          pages: totalPages || 1,
          total
        }
      }
    }
  })

  // ===============================================
  // 3. LOADING & ERROR STATES
  // ===============================================
  if (isLoading)
    return (
      <div className="p-6 text-gray-500">Đang tải danh sách đơn hàng...</div>
    )
  if (isError)
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">Lỗi tải danh sách đơn hàng.</div>
        <Button onClick={() => refetch()} variant="outline">
          Thử lại
        </Button>
      </div>
    )

  // Safety Data
  const items = data?.items || []
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 }

  // ===============================================
  // 4. BULK SELECT HANDLERS
  // ===============================================
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selected.length === items.length) setSelected([])
    else setSelected(items.map((x: any) => x._id))
  }

  // ===============================================
  // 5. RENDER UI
  // ===============================================
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Đơn hàng</h1>
          <p className="text-sm text-gray-500">
            Quản lý và xử lý đơn đặt hàng từ khách
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <GlassCard className="py-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm tên khách, SĐT, mã đơn..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setPage(1)
              setStatusFilter(v)
            }}
          >
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <SelectValue placeholder="Trạng thái" />
              </div>
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

          <Select
            value={sort}
            onValueChange={(v) => {
              setPage(1)
              setSort(v)
            }}
          >
            <SelectTrigger className="w-48">
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
      </GlassCard>

      {/* TABLE */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Danh sách đơn hàng</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Total: {pagination.total}
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <input
                  type="checkbox"
                  checked={selected.length === items.length && items.length > 0}
                  onChange={selectAll}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </TableHead>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead className="text-center">SP</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((order: any) => (
              <TableRow
                key={order._id}
                className={
                  selected.includes(order._id) ? 'bg-orange-50/30' : ''
                }
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(order._id)}
                    onChange={() => toggleSelect(order._id)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    #{order._id?.slice(-6).toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.customerPhone}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className="max-w-[200px] truncate text-sm text-gray-600"
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
                <TableCell className="text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <InvoicePDFClient order={order} />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedOrderId(order._id)}
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-12 text-gray-500"
                >
                  {isLoading
                    ? 'Đang tải...'
                    : 'Không có đơn hàng nào khớp bộ lọc.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600 border-t pt-4">
          <div>
            Trang {pagination.page}/{pagination.pages} · Hiển thị {items.length}{' '}
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

      {/* ORDER DETAIL DIALOG */}
      <OrderDetailDialog
        orderId={selectedOrderId}
        onClose={handleCloseDialog} // 👈 Dùng hàm đóng mới
      />
    </div>
  )
}

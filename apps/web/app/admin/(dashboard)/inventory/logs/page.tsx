'use client'

import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

import Link from 'next/link'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { History } from 'lucide-react'
import GlassCard from '@/src/components/admin/GlassCard'

type StockLog = {
  _id: string
  product: {
    _id: string
    name: string
    slug: string
  }
  change: number
  oldStock: number
  newStock: number
  type: string
  note?: string
  admin?: {
    _id: string
    name?: string
    email?: string
  }
  createdAt: string
}

type StockLogsResponse = {
  items: StockLog[]
  page: number
  pages: number
  total: number
}

function typeLabel(t: string) {
  switch (t) {
    case 'import':
      return 'Nhập hàng'
    case 'return':
      return 'Hoàn hàng'
    case 'bulk':
      return 'Điều chỉnh hàng loạt'
    case 'manual':
      return 'Thủ công'
    default:
      return 'Điều chỉnh'
  }
}

function typeColor(t: string) {
  switch (t) {
    case 'import':
      return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
    case 'return':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
    case 'bulk':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
    case 'manual':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
}

export default function StockLogsPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>(
    '30d'
  )

  const buildParams = () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '20')

    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (query.trim() !== '') params.set('q', query.trim())

    const now = new Date()
    if (dateRange === '7d') {
      const from = new Date(now)
      from.setDate(from.getDate() - 7)
      params.set('from', from.toISOString().slice(0, 10))
    }
    if (dateRange === '30d') {
      const from = new Date(now)
      from.setDate(from.getDate() - 30)
      params.set('from', from.toISOString().slice(0, 10))
    }
    if (dateRange === '90d') {
      const from = new Date(now)
      from.setDate(from.getDate() - 90)
      params.set('from', from.toISOString().slice(0, 10))
    }

    return params.toString()
  }

  const { data, isLoading, isError } = useQuery<StockLogsResponse>({
    queryKey: ['stock-logs', page, typeFilter, query, dateRange],
    queryFn: async () => {
      const queryString = buildParams()
      const res = await api.get(`/admin/stock-logs?${queryString}`)
      return res.data
    }
  })

  if (isLoading) return <div className="p-6">Đang tải lịch sử tồn kho...</div>
  if (isError)
    return (
      <div className="p-6 text-red-600">
        Lỗi tải lịch sử tồn kho. Vui lòng thử lại.
      </div>
    )

  const items = data?.items ?? []
  const currentPage = data?.page ?? page
  const totalPages = data?.pages ?? 1

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Lịch sử tồn kho
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Theo dõi tất cả lần điều chỉnh, nhập/xuất tồn kho
          </p>
        </div>

        <Link href="/admin/inventory">
          <Button
            variant="outline"
            className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
          >
            Quay lại tồn kho
          </Button>
        </Link>
      </div>

      {/* FILTER BAR */}
      <GlassCard className="py-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Input
            placeholder="Tìm theo sản phẩm hoặc ghi chú..."
            className="w-full md:w-72"
            value={query}
            onChange={(e) => {
              setPage(1)
              setQuery(e.target.value)
            }}
          />

          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setPage(1)
              setTypeFilter(v)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Loại điều chỉnh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="adjust">Điều chỉnh</SelectItem>
              <SelectItem value="import">Nhập hàng</SelectItem>
              <SelectItem value="return">Hoàn hàng</SelectItem>
              <SelectItem value="bulk">Hàng loạt</SelectItem>
              <SelectItem value="manual">Thủ công</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={dateRange}
            onValueChange={(v: any) => {
              setPage(1)
              setDateRange(v)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 ngày gần đây</SelectItem>
              <SelectItem value="30d">30 ngày gần đây</SelectItem>
              <SelectItem value="90d">90 ngày gần đây</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* TABLE */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-orange-600" />
            Lịch sử điều chỉnh
          </h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Thay đổi</TableHead>
              <TableHead>Trước → Sau</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((log) => (
              <TableRow key={log._id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {format(new Date(log.createdAt), 'HH:mm dd/MM/yyyy', {
                    locale: vi
                  })}
                </TableCell>

                <TableCell className="max-w-[220px]">
                  <div className="font-medium line-clamp-2">
                    {log.product?.name || '—'}
                  </div>
                  {log.product && (
                    <div className="text-xs text-gray-400">
                      <Link
                        href={`/admin/products/${log.product._id}`}
                        className="hover:underline"
                      >
                        /products/{log.product.slug}
                      </Link>
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <span
                    className={
                      log.change > 0
                        ? 'text-green-600 dark:text-green-400 font-semibold'
                        : log.change < 0
                        ? 'text-red-600 dark:text-red-400 font-semibold'
                        : 'text-gray-500'
                    }
                  >
                    {log.change > 0 ? `+${log.change}` : log.change}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-sm">
                    {log.oldStock} →{' '}
                    <span className="font-semibold">{log.newStock}</span>
                  </span>
                </TableCell>

                <TableCell>
                  <Badge className={typeColor(log.type)}>
                    {typeLabel(log.type)}
                  </Badge>
                </TableCell>

                <TableCell>
                  {log.admin ? (
                    <div className="text-sm">
                      <div className="font-medium">
                        {log.admin.name || 'Admin'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {log.admin.email}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Hệ thống
                    </span>
                  )}
                </TableCell>

                <TableCell className="max-w-[260px]">
                  <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {log.note || '—'}
                  </span>
                </TableCell>
              </TableRow>
            ))}

            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  Không có bản ghi nào khớp bộ lọc.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10 text-sm text-gray-600 dark:text-gray-400">
          <div>
            Trang {currentPage}/{totalPages} · Tổng {data?.total ?? 0} bản ghi
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹ Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau ›
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

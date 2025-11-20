'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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

    // 'all' thì không set from/to
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lịch sử tồn kho</h1>
          <p className="text-sm text-gray-500">
            Theo dõi tất cả lần điều chỉnh, nhập/xuất tồn kho.
          </p>
        </div>

        <Link href="/admin/inventory">
          <Button variant="outline">Quay lại tồn kho</Button>
        </Link>
      </div>

      {/* FILTER BAR */}
      <Card>
        <CardContent className="py-4 flex flex-col md:flex-row md:items-center gap-4">
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
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử điều chỉnh</CardTitle>
        </CardHeader>
        <CardContent>
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
                          ? 'text-green-600 font-semibold'
                          : log.change < 0
                          ? 'text-red-600 font-semibold'
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
                    <Badge variant="outline">{typeLabel(log.type)}</Badge>
                  </TableCell>

                  <TableCell>
                    {log.admin ? (
                      <div className="text-sm">
                        <div>{log.admin.name || 'Admin'}</div>
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
                    <span className="text-sm text-gray-700 line-clamp-2">
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
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
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
        </CardContent>
      </Card>
    </div>
  )
}

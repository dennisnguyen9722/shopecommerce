'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/src/lib/api'

import GlassCard from '@/src/components/admin/GlassCard'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent
} from '@/components/ui/select'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const statusLabel: Record<string, string> = {
  active: 'Đang hoạt động',
  blocked: 'Bị chặn',
  suspended: 'Tạm ngưng',
  deactivated: 'Ngừng kích hoạt'
}

export default function CustomersPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)

  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState('all')
  const [sort, setSort] = useState('newest')
  const [status, setStatus] = useState('all')

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/customers', {
        params: {
          page,
          search,
          segment,
          sort,
          status
        }
      })
      setItems(data.items)
      setPagination(data.pagination)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1)
  }, [search, segment, sort, status])

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Khách hàng</h1>
          <p className="text-sm text-muted-foreground">
            Danh sách khách hàng mua sắm tại cửa hàng.
          </p>
        </div>
      </div>

      {/* FILTER BAR — GLASS */}
      <GlassCard className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Input
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full md:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Phân khúc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="new">Khách mới</SelectItem>
              <SelectItem value="inactive">Không mua lâu</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="blocked">Bị chặn</SelectItem>
              <SelectItem value="suspended">Tạm ngưng</SelectItem>
              <SelectItem value="deactivated">Ngừng kích hoạt</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
              <SelectItem value="totalSpent">Tổng chi tiêu</SelectItem>
              <SelectItem value="orders">Số đơn hàng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-2 text-sm text-muted-foreground border-t border-white/20">
          Hiển thị {items.length} khách hàng
        </div>
      </GlassCard>

      {/* TABLE — GLASS */}
      <GlassCard>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead>Đơn hàng</TableHead>
              <TableHead>Tổng chi</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500"
                >
                  Không có khách hàng nào
                </TableCell>
              </TableRow>
            )}

            {items.map((c) => (
              <TableRow
                key={c._id}
                className="cursor-pointer hover:bg-white/30 transition"
                onClick={() => router.push(`/admin/customers/${c._id}`)}
              >
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone || '-'}</TableCell>

                <TableCell>{c.ordersCount}</TableCell>

                <TableCell>
                  {Number(c.totalSpent ?? 0).toLocaleString()}₫
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {c.tags?.map((t: string) => (
                      <Badge key={t} className="bg-purple-100 text-purple-700">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline">{statusLabel[c.status]}</Badge>
                </TableCell>

                <TableCell>
                  {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>

      {/* PAGINATION */}
      {pagination && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>
            Trang {pagination.page} / {pagination.pages}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchData(pagination.page - 1)}
            >
              ‹ Trước
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchData(pagination.page + 1)}
            >
              Sau ›
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

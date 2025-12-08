'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/src/lib/api'
import GlassCard from '@/src/components/admin/GlassCard'
import ConfirmDialog from '@/src/components/admin/ConfirmDialog'
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
import { Users, Crown, UserPlus, Download, Search } from 'lucide-react'
import { toast } from 'sonner'

const statusLabel: Record<string, string> = {
  active: 'Đang hoạt động',
  blocked: 'Bị chặn',
  suspended: 'Tạm ngưng',
  deactivated: 'Ngưng kích hoạt'
}

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
  suspended: 'bg-yellow-100 text-yellow-700',
  deactivated: 'bg-gray-100 text-gray-700'
}

const tierColor: Record<string, string> = {
  platinum: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  gold: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
  silver: 'bg-gradient-to-r from-gray-300 to-gray-400 text-white',
  bronze: 'bg-gradient-to-r from-orange-300 to-amber-500 text-white'
}

export default function CustomersPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    vip: 0,
    new: 0
  })

  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState('all')
  const [sort, setSort] = useState('newest')
  const [status, setStatus] = useState('all')

  // 🆕 Confirm dialog state
  const [showConfirm, setShowConfirm] = useState(false)

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/customers', {
        params: {
          page,
          search,
          segment: segment === 'all' ? '' : segment,
          sort,
          status: status === 'all' ? '' : status
        }
      })
      setItems(data.items)
      setPagination(data.pagination)

      // Calculate stats
      setStats({
        total: data.pagination.total,
        active: data.items.filter((c: any) => c.status === 'active').length,
        vip: data.items.filter((c: any) => c.totalSpent >= 10_000_000).length,
        new: data.items.filter((c: any) => {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          return new Date(c.createdAt) >= thirtyDaysAgo
        }).length
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1)
  }, [search, segment, sort, status])

  const syncFromOrders = async () => {
    try {
      const { data } = await api.post('/admin/customers/sync-from-orders')
      toast.success(
        `Đã sync: ${data.created} khách mới, ${data.updated} khách cũ`
      )
      fetchData(1)
    } catch (err) {
      toast.error('Lỗi khi sync dữ liệu')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold dark:text-gray-900">
            Khách hàng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý thông tin khách hàng và chương trình loyalty
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(true)}
        >
          <Download className="w-4 h-4 mr-2" />
          Sync từ Orders
        </Button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="bg-gradient-to-br from-blue-50/60 to-cyan-50/60 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tổng khách hàng
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.total}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-green-50/60 to-emerald-50/60 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Đang hoạt động
            </div>
            <div className="text-3xl font-bold text-green-600">
              {stats.active}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-purple-50/60 to-pink-50/60 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Khách VIP
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {stats.vip}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-orange-50/60 to-amber-50/60 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Khách mới (30 ngày)
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {stats.new}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* FILTER BAR */}
      <GlassCard className="py-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Phân khúc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="vip">VIP (≥10M)</SelectItem>
              <SelectItem value="premium">Premium (≥5M)</SelectItem>
              <SelectItem value="new">Khách mới</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="blocked">Bị chặn</SelectItem>
              <SelectItem value="suspended">Tạm ngưng</SelectItem>
              <SelectItem value="deactivated">Ngưng kích hoạt</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
              <SelectItem value="totalSpent">Tổng chi tiêu</SelectItem>
              <SelectItem value="orders">Số đơn hàng</SelectItem>
              <SelectItem value="points">Loyalty Points</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* TABLE */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Danh sách khách hàng</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Loyalty</TableHead>
              <TableHead className="text-right">Đơn hàng</TableHead>
              <TableHead className="text-right">Tổng chi</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-gray-500"
                >
                  Không có khách hàng nào
                </TableCell>
              </TableRow>
            ) : (
              items.map((c) => (
                <TableRow
                  key={c._id}
                  className="cursor-pointer hover:bg-white/30 transition"
                  onClick={() => router.push(`/admin/customers/${c._id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {c.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        {c.password === null && (
                          <Badge variant="outline" className="text-xs">
                            Guest
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-white">
                        {c.email}
                      </div>
                      <div className="text-gray-500 dark:text-white">
                        {c.phone || '—'}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        className={
                          tierColor[c.loyaltyTier || 'bronze'] || 'bg-gray-200'
                        }
                      >
                        {(c.loyaltyTier || 'bronze').toUpperCase()}
                      </Badge>
                      <div className="text-xs text-gray-600">
                        {(c.loyaltyPoints || 0).toLocaleString()} điểm
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right font-medium">
                    {c.ordersCount || 0}
                  </TableCell>

                  <TableCell className="text-right font-bold text-green-600">
                    {Number(c.totalSpent ?? 0).toLocaleString()}₫
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.tags?.slice(0, 2).map((t: string) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="text-xs bg-purple-100 text-purple-700"
                        >
                          {t}
                        </Badge>
                      ))}
                      {c.tags?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{c.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={statusColor[c.status]}>
                      {statusLabel[c.status]}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm text-gray-600 dark:text-white">
                    {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/customers/${c._id}`)
                      }}
                    >
                      Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        {pagination && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20 text-sm text-gray-600">
            <div>
              Trang {pagination.page}/{pagination.pages} · Tổng{' '}
              {pagination.total} khách hàng
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
      </GlassCard>

      {/* 🆕 Confirm Dialog */}
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={syncFromOrders}
        title="Sync khách hàng từ Orders"
        description="Sync tất cả khách hàng từ orders? Thao tác này có thể mất vài phút."
        confirmText="Đồng ý"
        cancelText="Hủy"
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, ToggleLeft, ToggleRight, Edit, Gift } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import ConfirmDeleteDialog from '@/src/components/admin/ConfirmDeleteDialog'
import GlassCard from '@/src/components/admin/GlassCard'
import { toast } from 'sonner'

// ===============================================
// UTILS
// ===============================================
const formatCurrency = (n: number | undefined) => {
  if (typeof n !== 'number') return '0 ₫'
  return n.toLocaleString('vi-VN') + ' ₫'
}

const getRewardTypeLabel = (type: string) => {
  switch (type) {
    case 'discount_fixed':
      return 'Giảm tiền mặt'
    case 'discount_percentage':
      return 'Giảm %'
    case 'free_shipping':
      return 'Freeship'
    case 'gift':
      return 'Quà tặng'
    default:
      return type
  }
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'platinum':
      return 'bg-slate-800 text-white'
    case 'gold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'silver':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-orange-50 text-orange-800 border-orange-200' // Bronze
  }
}

export default function RewardsPage() {
  const router = useRouter()

  // ===============================================
  // FILTER STATE
  // ===============================================
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const pageSize = 10

  // ===============================================
  // FETCH REWARDS
  // ===============================================
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-rewards', search, typeFilter, statusFilter, page],
    queryFn: async () => {
      const res = await api.get('/admin/rewards', {
        params: {
          search,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          isActive:
            statusFilter === 'all' ? undefined : statusFilter === 'active',
          page,
          limit: pageSize
        }
      })
      return res.data
    }
  })

  if (isLoading)
    return <div className="p-6">Đang tải danh sách quà tặng...</div>
  if (isError) return <div className="p-6 text-red-600">Lỗi tải dữ liệu.</div>

  const items = data?.items || []
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 }

  // ===============================================
  // ACTIONS
  // ===============================================
  const deleteReward = async (id: string) => {
    try {
      await api.delete(`/admin/rewards/${id}`)
      toast.success('Đã xoá reward thành công')
      refetch()
    } catch (e) {
      toast.error('Lỗi xoá reward')
    }
  }

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      await api.put(`/admin/rewards/${id}/toggle`)
      toast.success('Cập nhật trạng thái thành công')
      refetch()
    } catch (e) {
      toast.error('Lỗi cập nhật trạng thái')
    }
  }

  // ===============================================
  // UI
  // ===============================================
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý Đổi quà (Rewards)</h1>
        <Button onClick={() => router.push('/admin/rewards/new')}>
          <Plus className="w-4 h-4 mr-2" /> Tạo quà mới
        </Button>
      </div>

      {/* FILTER BAR */}
      <GlassCard className="py-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <Input
            placeholder="Tìm theo tên reward..."
            className="w-full md:w-64"
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
          />

          {/* TYPE FILTER */}
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setPage(1)
              setTypeFilter(v)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Loại quà" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="discount_fixed">Giảm tiền mặt</SelectItem>
              <SelectItem value="discount_percentage">Giảm theo %</SelectItem>
              <SelectItem value="free_shipping">Freeship</SelectItem>
            </SelectContent>
          </Select>

          {/* STATUS FILTER */}
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setPage(1)
              setStatusFilter(v)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Đã ẩn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* TABLE */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Danh sách quà tặng</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên quà tặng</TableHead>
              <TableHead>Mã (Prefix)</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Điểm đổi</TableHead>
              <TableHead>Hạng tối thiểu</TableHead>
              <TableHead>Đã đổi</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item: any) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Gift size={16} />
                    </div>
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs bg-gray-50 text-gray-700 border-gray-200"
                  >
                    {item.codePrefix || 'REWARD'}-****
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge variant="outline">
                    {getRewardTypeLabel(item.type)}
                  </Badge>
                </TableCell>

                <TableCell>
                  {item.type === 'discount_percentage' ? (
                    <span className="text-red-600 font-bold">
                      {item.value}%
                    </span>
                  ) : item.type === 'free_shipping' ? (
                    <span className="text-green-600 font-bold">Free</span>
                  ) : (
                    <span className="text-red-600 font-bold">
                      {formatCurrency(item.value)}
                    </span>
                  )}
                </TableCell>

                <TableCell className="font-bold text-indigo-600">
                  {item.pointsRequired.toLocaleString()}
                </TableCell>

                <TableCell>
                  <Badge
                    className={`${getTierColor(
                      item.tierRequired
                    )} uppercase text-[10px]`}
                  >
                    {item.tierRequired || 'Bronze'}
                  </Badge>
                </TableCell>

                <TableCell>{item.redemptionCount || 0}</TableCell>

                <TableCell>
                  <button
                    onClick={() => toggleStatus(item._id, item.isActive)}
                    className="flex items-center"
                  >
                    {item.isActive ? (
                      <ToggleRight className="w-6 h-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </TableCell>

                <TableCell className="text-right flex justify-end gap-2">
                  <Link href={`/admin/rewards/${item._id}`}>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <ConfirmDeleteDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <span className="sr-only">Delete</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      </Button>
                    }
                    title="Xoá quà tặng?"
                    description="Hành động này không thể hoàn tác. Các voucher đã đổi vẫn sẽ tồn tại."
                    onConfirm={() => deleteReward(item._id)}
                  />
                </TableCell>
              </TableRow>
            ))}

            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  Không có quà tặng nào. Hãy tạo mới ngay!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        {pagination.pages > 1 && (
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            >
              Sau
            </Button>
          </div>
        )}
      </GlassCard>
    </div>
  )
}

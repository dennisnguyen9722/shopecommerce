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
import { Plus, ToggleLeft, ToggleRight, Edit, Ticket } from 'lucide-react'
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

const getDiscountTypeLabel = (type: string) => {
  switch (type) {
    case 'percentage':
      return 'Giảm %'
    case 'fixed':
      return 'Giảm tiền'
    case 'free_shipping':
      return 'Free Ship'
    default:
      return type
  }
}

const getCustomerTypeLabel = (type: string) => {
  switch (type) {
    case 'all':
      return 'Tất cả'
    case 'new':
      return 'Mới'
    case 'existing':
      return 'Cũ'
    default:
      return type
  }
}

const getCouponStatus = (coupon: any) => {
  const now = new Date()
  const start = new Date(coupon.startDate)
  const end = new Date(coupon.endDate)

  if (!coupon.isActive) {
    return { label: 'Đã tắt', color: 'bg-gray-100 text-gray-800' }
  }

  if (now < start) {
    return { label: 'Chưa bắt đầu', color: 'bg-blue-100 text-blue-800' }
  }

  if (now > end) {
    return { label: 'Hết hạn', color: 'bg-red-100 text-red-800' }
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { label: 'Hết lượt', color: 'bg-orange-100 text-orange-800' }
  }

  return { label: 'Hoạt động', color: 'bg-green-100 text-green-800' }
}

export default function CouponsPage() {
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const pageSize = 10

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-coupons', search, statusFilter, page],
    queryFn: async () => {
      const res = await api.get('/admin/coupons', {
        params: {
          search,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          page,
          limit: pageSize
        }
      })
      return res.data
    }
  })

  if (isLoading)
    return <div className="p-6">Đang tải danh sách mã giảm giá...</div>
  if (isError) return <div className="p-6 text-red-600">Lỗi tải dữ liệu.</div>

  const coupons = data?.coupons || []
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 }

  const deleteCoupon = async (id: string) => {
    try {
      await api.delete(`/admin/coupons/${id}`)
      toast.success('Đã xóa mã giảm giá')
      refetch()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi xóa')
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/coupons/${id}`, {
        isActive: !currentStatus
      })
      toast.success('Cập nhật trạng thái thành công')
      refetch()
    } catch (e) {
      toast.error('Lỗi cập nhật')
    }
  }

  const formatDiscount = (coupon: any) => {
    if (coupon.discountType === 'percentage') {
      return (
        <span className="text-red-600 font-bold text-sm">
          {coupon.discountValue}%
        </span>
      )
    } else if (coupon.discountType === 'fixed') {
      return (
        <span className="text-red-600 font-bold text-sm">
          {formatCurrency(coupon.discountValue)}
        </span>
      )
    } else {
      return <span className="text-green-600 font-bold text-xs">Free Ship</span>
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold dark:text-gray-900">
            Mã giảm giá
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tạo và quản lý các mã giảm giá marketing
          </p>
        </div>
        <Button onClick={() => router.push('/admin/coupons/new')}>
          <Plus className="w-4 h-4 mr-2" /> Tạo mã mới
        </Button>
      </div>

      {/* FILTER BAR */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Tìm theo mã coupon..."
            className="w-full md:w-64"
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
          />

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setPage(1)
              setStatusFilter(v)
            }}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Đã tắt</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* TABLE */}
      <GlassCard className="overflow-hidden p-0">
        <div className="px-4 py-4 border-b">
          <h2 className="text-lg font-semibold">Danh sách mã giảm giá</h2>
        </div>

        {/* 🔥 KEY FIX: Wrapper overflow */}
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Mã</TableHead>
                <TableHead className="w-[180px]">Mô tả</TableHead>
                <TableHead className="w-[80px]">Loại</TableHead>
                <TableHead className="w-[100px]">Giảm giá</TableHead>
                <TableHead className="w-[100px]">Đơn tối thiểu</TableHead>
                <TableHead className="w-[80px]">Sử dụng</TableHead>
                <TableHead className="w-[80px]">Khách</TableHead>
                <TableHead className="w-[120px]">Thời gian</TableHead>
                <TableHead className="w-[100px]">Trạng thái</TableHead>
                <TableHead className="w-[100px] text-right"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {coupons.map((coupon: any) => {
                const status = getCouponStatus(coupon)
                return (
                  <TableRow key={coupon._id} className="hover:bg-gray-50/50">
                    {/* MÃ */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                          <Ticket size={14} />
                        </div>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {coupon.code}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* MÔ TẢ */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs line-clamp-2">
                          {coupon.description}
                        </div>
                        {coupon.autoApply && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-blue-50 text-blue-600 border-blue-200"
                          >
                            Auto
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* LOẠI */}
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {getDiscountTypeLabel(coupon.discountType)}
                      </Badge>
                    </TableCell>

                    {/* GIÁ TRỊ */}
                    <TableCell>{formatDiscount(coupon)}</TableCell>

                    {/* ĐƠN TỐI THIỂU */}
                    <TableCell>
                      {coupon.minOrderAmount ? (
                        <span className="text-xs">
                          {formatCurrency(coupon.minOrderAmount)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </TableCell>

                    {/* SỬ DỤNG */}
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-bold text-indigo-600">
                          {coupon.usedCount}
                        </span>
                        {coupon.usageLimit && (
                          <span className="text-gray-500">
                            /{coupon.usageLimit}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* KHÁCH */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-slate-50"
                      >
                        {getCustomerTypeLabel(coupon.customerType)}
                      </Badge>
                    </TableCell>

                    {/* THỜI GIAN */}
                    <TableCell>
                      <div className="text-[10px] space-y-0.5">
                        <div className="text-gray-600">
                          {new Date(coupon.startDate).toLocaleDateString(
                            'vi-VN'
                          )}
                        </div>
                        <div className="text-gray-400">
                          →{' '}
                          {new Date(coupon.endDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </TableCell>

                    {/* TRẠNG THÁI */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={`${status.color} text-[10px] px-1.5`}>
                          {status.label}
                        </Badge>
                        <button
                          onClick={() =>
                            toggleStatus(coupon._id, coupon.isActive)
                          }
                          className="flex items-center"
                        >
                          {coupon.isActive ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* THAO TÁC */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/coupons/${coupon._id}`}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <ConfirmDeleteDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
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
                          title="Xóa mã giảm giá?"
                          description="Mã đã được sử dụng sẽ chỉ bị vô hiệu hóa."
                          onConfirm={() => deleteCoupon(coupon._id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}

              {coupons.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Không có mã giảm giá nào. Hãy tạo mới!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center p-4 border-t text-xs text-gray-600">
            <div>
              Trang {page}/{pagination.pages} · {pagination.total} mã
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
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
              >
                Sau ›
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}

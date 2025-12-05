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
      return 'Giảm tiền mặt'
    case 'free_shipping':
      return 'Miễn phí ship'
    default:
      return type
  }
}

const getCustomerTypeLabel = (type: string) => {
  switch (type) {
    case 'all':
      return 'Tất cả'
    case 'new':
      return 'Khách mới'
    case 'existing':
      return 'Khách cũ'
    default:
      return type
  }
}

// Hàm kiểm tra trạng thái coupon
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

  return { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800' }
}

export default function CouponsPage() {
  const router = useRouter()

  // ===============================================
  // FILTER STATE
  // ===============================================
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const pageSize = 10

  // ===============================================
  // FETCH COUPONS
  // ===============================================
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

  // ===============================================
  // ACTIONS
  // ===============================================
  const deleteCoupon = async (id: string) => {
    try {
      await api.delete(`/admin/coupons/${id}`)
      toast.success('Đã xóa mã giảm giá thành công')
      refetch()
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Lỗi xóa mã giảm giá'
      toast.error(msg)
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
      toast.error('Lỗi cập nhật trạng thái')
    }
  }

  // Format giá trị giảm
  const formatDiscount = (coupon: any) => {
    if (coupon.discountType === 'percentage') {
      return (
        <span className="text-red-600 font-bold">{coupon.discountValue}%</span>
      )
    } else if (coupon.discountType === 'fixed') {
      return (
        <span className="text-red-600 font-bold">
          {formatCurrency(coupon.discountValue)}
        </span>
      )
    } else {
      return <span className="text-green-600 font-bold">Free Ship</span>
    }
  }

  // ===============================================
  // UI
  // ===============================================
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Quản lý Mã giảm giá (Coupon)
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
      <GlassCard className="py-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <Input
            placeholder="Tìm theo mã coupon..."
            className="w-full md:w-64"
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                refetch()
              }
            }}
          />

          {/* STATUS FILTER */}
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setPage(1)
              setStatusFilter(v)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Đã tắt</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* TABLE */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Danh sách mã giảm giá</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Đơn tối thiểu</TableHead>
              <TableHead>Sử dụng</TableHead>
              <TableHead>Áp dụng cho</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {coupons.map((coupon: any) => {
              const status = getCouponStatus(coupon)
              return (
                <TableRow key={coupon._id}>
                  {/* MÃ COUPON */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Ticket size={16} />
                      </div>
                      <Badge
                        variant="outline"
                        className="font-mono font-bold text-sm bg-purple-50 text-purple-700 border-purple-200"
                      >
                        {coupon.code}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* MÔ TÁ */}
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div className="text-sm line-clamp-2">
                        {coupon.description}
                      </div>
                      {coupon.autoApply && (
                        <Badge
                          variant="outline"
                          className="text-xs mt-1 bg-blue-50 text-blue-600 border-blue-200"
                        >
                          Tự động áp dụng
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* LOẠI */}
                  <TableCell>
                    <Badge variant="outline">
                      {getDiscountTypeLabel(coupon.discountType)}
                    </Badge>
                  </TableCell>

                  {/* GIÁ TRỊ GIẢM */}
                  <TableCell>{formatDiscount(coupon)}</TableCell>

                  {/* ĐƠN TỐI THIỂU */}
                  <TableCell>
                    {coupon.minOrderAmount ? (
                      <span className="text-sm">
                        {formatCurrency(coupon.minOrderAmount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>

                  {/* SỬ DỤNG */}
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-bold text-indigo-600">
                        {coupon.usedCount}
                      </span>
                      {coupon.usageLimit && (
                        <span className="text-gray-500">
                          {' / '}
                          {coupon.usageLimit}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* ÁP DỤNG CHO */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs bg-slate-50 text-slate-700"
                    >
                      {getCustomerTypeLabel(coupon.customerType)}
                    </Badge>
                  </TableCell>

                  {/* THỜI GIAN */}
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div className="text-gray-600">
                        {new Date(coupon.startDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-gray-400">
                        → {new Date(coupon.endDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </TableCell>

                  {/* TRẠNG THÁI */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className={`${status.color} text-xs`}>
                        {status.label}
                      </Badge>
                      <button
                        onClick={() =>
                          toggleStatus(coupon._id, coupon.isActive)
                        }
                        className="flex items-center"
                      >
                        {coupon.isActive ? (
                          <ToggleRight className="w-6 h-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  {/* THAO TÁC */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/coupons/${coupon._id}`}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
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
                        title="Xóa mã giảm giá?"
                        description="Hành động này không thể hoàn tác. Mã đã được sử dụng sẽ chỉ bị vô hiệu hóa."
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
                  Không có mã giảm giá nào. Hãy tạo mới ngay!
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
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              Trang {page} / {pagination.pages}
            </span>
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

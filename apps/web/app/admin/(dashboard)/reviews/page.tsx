'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

import GlassCard from '@/src/components/admin/GlassCard'
import ConfirmDeleteDialog from '@/src/components/admin/ConfirmDeleteDialog'
import ReviewDetailDialog from '@/src/components/admin/ReviewDetailDialog'

import { toast } from 'sonner'
import { Star, CheckCircle2, Eye, Trash2, Search, Filter } from 'lucide-react'

// ===============================================
// UTILS
// ===============================================
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none uppercase text-[10px] tracking-wider">
          Đã duyệt
        </Badge>
      )
    case 'pending':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 shadow-none uppercase text-[10px] tracking-wider">
          Chờ duyệt
        </Badge>
      )
    case 'rejected':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none uppercase text-[10px] tracking-wider">
          Từ chối
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function ReviewsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // ===============================================
  // FILTERS
  // ===============================================
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const pageSize = 10

  // ===============================================
  // FETCH REVIEWS
  // ===============================================
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-reviews', search, statusFilter, page],
    queryFn: async () => {
      const res = await api.get('/admin/reviews', {
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

  // ===============================================
  // ACTIONS
  // ===============================================
  const deleteReview = async (id: string) => {
    try {
      await api.delete(`/admin/reviews/${id}`)
      toast.success('Đã xoá đánh giá')
      refetch()
    } catch (e) {
      toast.error('Lỗi xoá đánh giá')
    }
  }

  const toggleStatus = async (id: string, current: string) => {
    try {
      const newStatus = current === 'approved' ? 'rejected' : 'approved'
      const statusToSend = current === 'pending' ? 'approved' : newStatus

      await api.put(`/admin/reviews/${id}/status`, { status: statusToSend })

      const msg =
        statusToSend === 'approved' ? 'Đã duyệt đánh giá' : 'Đã ẩn đánh giá'
      toast.success(msg)
      refetch()
    } catch (e) {
      toast.error('Lỗi cập nhật trạng thái')
    }
  }

  const items = data?.items || []
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 }

  if (isError) return <div className="p-6 text-red-600">Lỗi tải dữ liệu.</div>

  // ===============================================
  // UI
  // ===============================================
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Đánh giá sản phẩm
        </h1>
        <p className="text-muted-foreground">
          Quản lý và phản hồi ý kiến khách hàng.
        </p>
      </div>

      {/* FILTER BAR */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo nội dung, tên khách, email..."
              className="pl-9 bg-white dark:bg-gray-900/50"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground hidden md:block" />
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setPage(1)
                setStatusFilter(v)
              }}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-gray-900/50">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="rejected">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {/* TABLE */}
      <GlassCard className="overflow-hidden p-0">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
            <TableRow>
              <TableHead className="w-[300px]">Sản phẩm</TableHead>
              <TableHead className="w-[250px]">Người đánh giá</TableHead>
              <TableHead className="w-[120px]">Rating</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead className="w-[150px]">Thời gian</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-[120px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell
                    colSpan={7}
                    className="h-16 text-center text-muted-foreground animate-pulse"
                  >
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  Không tìm thấy đánh giá nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item: any) => {
                // ========================================================
                // 1️⃣ LOGIC LẤY ẢNH (FIXED FOR OBJECT STRUCTURE)
                // ========================================================

                const rawImg = item.product?.images?.[0]
                let validProductImg: string | null = null

                // Case 1: Nếu là string (format cũ)
                if (typeof rawImg === 'string' && rawImg.trim() !== '') {
                  validProductImg = rawImg
                }
                // Case 2: Nếu là object chứa url (format Cloudinary như trong hình)
                else if (rawImg && typeof rawImg === 'object' && rawImg.url) {
                  validProductImg = rawImg.url
                }

                const productName = item.product?.name || 'Sản phẩm đã xoá'

                // Tương tự với Avatar nếu cần
                const rawAvatar = item.customerAvatar
                let validAvatar: string | null = null
                if (typeof rawAvatar === 'string' && rawAvatar.trim() !== '') {
                  validAvatar = rawAvatar
                } else if (
                  rawAvatar &&
                  typeof rawAvatar === 'object' &&
                  rawAvatar.url
                ) {
                  validAvatar = rawAvatar.url
                }
                // ========================================================

                return (
                  <TableRow
                    key={item._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* CỘT SẢN PHẨM */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden border bg-gray-100 flex-shrink-0">
                          {/* Chỉ render Image component nếu validProductImg hợp lệ */}
                          {validProductImg ? (
                            <Image
                              src={validProductImg}
                              alt={productName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400 bg-gray-200">
                              No img
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col">
                          {item.product ? (
                            <Link
                              href={`/admin/products/${item.product._id}`}
                              className="font-medium text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 hover:underline line-clamp-1"
                              title={productName}
                            >
                              {productName}
                            </Link>
                          ) : (
                            <span className="font-medium text-sm text-gray-400 italic">
                              Sản phẩm đã xoá
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            ID: {item.product?._id?.slice(-6) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* CỘT NGƯỜI ĐÁNH GIÁ */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          {validAvatar && <AvatarImage src={validAvatar} />}
                          <AvatarFallback className="text-xs font-bold bg-orange-100 text-orange-700">
                            {item.isAnonymous
                              ? 'A'
                              : item.customerName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          {item.isAnonymous ? (
                            <span className="font-medium text-sm italic text-gray-500">
                              Ẩn danh
                            </span>
                          ) : (
                            <>
                              <span className="font-medium text-sm">
                                {item.customerName || 'Khách hàng'}
                              </span>
                              <span
                                className="text-xs text-muted-foreground truncate max-w-[140px]"
                                title={item.customerEmail}
                              >
                                {item.customerEmail}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* RATING */}
                    <TableCell>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < item.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-100 text-gray-300'
                            }
                          />
                        ))}
                      </div>
                    </TableCell>

                    {/* NỘI DUNG */}
                    <TableCell>
                      <div
                        className="max-w-[300px] text-sm text-gray-600 dark:text-gray-300 line-clamp-2"
                        title={item.content}
                      >
                        {item.content}
                      </div>
                      {item.images?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          <div className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 border inline-flex items-center gap-1">
                            📷 Có {item.images.length} ảnh review
                          </div>
                        </div>
                      )}
                    </TableCell>

                    {/* THỜI GIAN */}
                    <TableCell className="text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>
                          {format(new Date(item.createdAt), 'dd/MM/yyyy', {
                            locale: vi
                          })}
                        </span>
                        <span className="text-xs">
                          {format(new Date(item.createdAt), 'HH:mm', {
                            locale: vi
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* TRẠNG THÁI */}
                    <TableCell>{getStatusBadge(item.status)}</TableCell>

                    {/* THAO TÁC */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${
                                  item.status === 'approved'
                                    ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                }`}
                                onClick={() =>
                                  toggleStatus(item._id, item.status)
                                }
                              >
                                <CheckCircle2 size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {item.status === 'approved'
                                  ? 'Từ chối hiển thị'
                                  : 'Duyệt hiển thị'}
                              </p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => setSelectedId(item._id)}
                              >
                                <Eye size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Xem chi tiết & Trả lời</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              {/* Wrap div để tránh lỗi ref tooltip */}
                              <div>
                                <ConfirmDeleteDialog
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  }
                                  title="Xoá đánh giá?"
                                  description="Hành động này sẽ xoá vĩnh viễn đánh giá này khỏi hệ thống."
                                  onConfirm={() => deleteReview(item._id)}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Xoá vĩnh viễn</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t bg-gray-50/50">
            <div className="text-sm text-muted-foreground">
              Trang {pagination.page} / {pagination.pages}
            </div>
            <div className="flex gap-2">
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
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      <ReviewDetailDialog
        reviewId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}

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

const getImageUrl = (img: any) => {
  if (!img) return null
  if (typeof img === 'string' && img.trim() !== '') return img
  if (typeof img === 'object' && img?.url) return img.url
  return null
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none hover:bg-green-100 whitespace-nowrap">
          Đã duyệt
        </Badge>
      )
    case 'pending':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 shadow-none hover:bg-yellow-100 whitespace-nowrap">
          Chờ duyệt
        </Badge>
      )
    case 'rejected':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 shadow-none hover:bg-red-100 whitespace-nowrap">
          Từ chối
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function ReviewsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const pageSize = 10

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
      toast.success(statusToSend === 'approved' ? 'Đã duyệt' : 'Đã ẩn')
      refetch()
    } catch (e) {
      toast.error('Lỗi cập nhật')
    }
  }

  const items = data?.items || []
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 }

  if (isError) return <div className="p-6 text-red-600">Lỗi tải dữ liệu.</div>

  return (
    <div className="p-4 md:p-6 space-y-6 w-full h-full">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Đánh giá sản phẩm
        </h1>
      </div>

      {/* FILTER BAR */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo nội dung, email..."
              className="pl-9 bg-white dark:bg-gray-900/50"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setPage(1)
                setStatusFilter(v)
              }}
            >
              <SelectTrigger className="w-full lg:w-[180px] bg-white dark:bg-gray-900/50">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {/* TABLE */}
      <GlassCard className="p-0 overflow-hidden">
        {/* Bỏ overflow-x-auto để tránh thanh cuộn */}
        <div className="w-full">
          {/* Dùng table-fixed để ép các cột tuân thủ độ rộng, giúp truncate hoạt động */}
          <Table className="w-full table-fixed">
            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
              <TableRow>
                {/* Điều chỉnh độ rộng % cho phù hợp */}
                <TableHead className="w-[30%]">Sản phẩm</TableHead>
                <TableHead className="w-[18%]">Người dùng</TableHead>
                <TableHead className="w-[100px] text-center">Rating</TableHead>
                <TableHead className="w-auto">Nội dung</TableHead>
                {/* Ẩn cột Ngày tạo trên màn hình nhỏ (hidden xl:table-cell) */}
                <TableHead className="w-[110px] hidden xl:table-cell">
                  Ngày tạo
                </TableHead>
                <TableHead className="w-[100px] text-center">
                  Trạng thái
                </TableHead>
                <TableHead className="w-[100px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell
                      colSpan={7}
                      className="h-16 text-center animate-pulse"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Không có đánh giá nào.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item: any, index: number) => {
                  const productImg = getImageUrl(item.product?.images?.[0])
                  const productName = item.product?.name || 'Sản phẩm đã xoá'

                  return (
                    <TableRow
                      key={item._id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      {/* SẢN PHẨM */}
                      <TableCell>
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="relative h-10 w-10 rounded overflow-hidden border bg-gray-100 flex-shrink-0">
                            {productImg ? (
                              <Image
                                src={productImg}
                                alt={productName}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">
                                No Img
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            {' '}
                            {/* min-w-0 quan trọng để truncate hoạt động trong flex */}
                            {item.product ? (
                              <Link
                                href={`/admin/products/${item.product._id}`}
                                className="font-medium text-sm hover:text-blue-600 truncate block w-full"
                                title={productName}
                              >
                                {productName}
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-400 italic truncate block">
                                Sản phẩm xoá
                              </span>
                            )}
                            {/* Ẩn ID trên màn hình nhỏ */}
                            <span className="text-[10px] text-muted-foreground hidden lg:block truncate">
                              ID: {item.product?._id?.slice(-6) || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* NGƯỜI DÙNG */}
                      <TableCell>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarFallback className="text-[10px] bg-orange-100 text-orange-700 font-bold">
                              {item.isAnonymous
                                ? 'A'
                                : item.customerName?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate block">
                              {item.isAnonymous ? 'Ẩn danh' : item.customerName}
                            </span>
                            {!item.isAnonymous && (
                              // Ẩn email trên màn hình nhỏ (chỉ hiện trên xl - 1280px trở lên)
                              <span
                                className="text-[10px] text-muted-foreground truncate hidden xl:block"
                                title={item.customerEmail}
                              >
                                {item.customerEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* RATING */}
                      <TableCell className="text-center">
                        <div className="flex justify-center text-yellow-400">
                          {/* Chỉ hiện 1 ngôi sao + số trên màn hình rất nhỏ nếu cần, hiện tại giữ nguyên 5 sao nhưng size nhỏ */}
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={i < item.rating ? 'currentColor' : 'none'}
                                className={
                                  i >= item.rating ? 'text-gray-300' : ''
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </TableCell>

                      {/* CONTENT */}
                      <TableCell>
                        <div
                          className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 break-words"
                          title={item.content}
                        >
                          {item.content}
                        </div>
                        {item.images?.length > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 border rounded text-[10px] text-gray-600">
                            📷 {item.images.length}
                          </div>
                        )}
                      </TableCell>

                      {/* DATE (Ẩn trên mobile/tablet) */}
                      <TableCell className="text-xs text-gray-500 whitespace-nowrap hidden xl:table-cell">
                        {format(new Date(item.createdAt), 'dd/MM/yyyy', {
                          locale: vi
                        })}
                      </TableCell>

                      {/* STATUS */}
                      <TableCell className="text-center">
                        {getStatusBadge(item.status)}
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Chỉ hiện icon duyệt/xoá, ẩn tooltip nếu chật quá */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleStatus(item._id, item.status)}
                          >
                            <CheckCircle2
                              size={16}
                              className={
                                item.status === 'approved'
                                  ? 'text-green-600'
                                  : 'text-gray-400'
                              }
                            />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-blue-600"
                            onClick={() => setSelectedId(item._id)}
                          >
                            <Eye size={16} />
                          </Button>

                          <ConfirmDeleteDialog
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </Button>
                            }
                            title="Xoá?"
                            description="Hành động không thể hoàn tác."
                            onConfirm={() => deleteReview(item._id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t bg-gray-50/50">
            <div className="text-xs text-muted-foreground">
              Trang {pagination.page}/{pagination.pages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
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

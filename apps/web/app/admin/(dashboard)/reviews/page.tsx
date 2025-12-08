// app/admin/(dashboard)/reviews/page.tsx
'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Eye,
  Clock,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  getAdminReviews,
  getReviewStats,
  updateReviewStatus,
  deleteAdminReview,
  replyToReview,
  bulkApproveReviews,
  bulkDeleteReviews,
  Review
} from '@/src/services/reviewsApi'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function AdminReviewsPage() {
  const queryClient = useQueryClient()

  // States
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'approved'
  >('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReviews, setSelectedReviews] = useState<string[]>([])
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyMessage, setReplyMessage] = useState('')

  // Query: Stats
  const { data: statsData } = useQuery({
    queryKey: ['admin-review-stats'],
    queryFn: getReviewStats
  })

  // Query: Reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: [
      'admin-reviews',
      statusFilter,
      ratingFilter,
      searchQuery,
      currentPage
    ],
    queryFn: () =>
      getAdminReviews({
        page: currentPage,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        rating: ratingFilter === 'all' ? undefined : parseInt(ratingFilter),
        search: searchQuery || undefined,
        sortBy: '-createdAt'
      })
  })

  // Mutations
  const approveReviewMutation = useMutation({
    mutationFn: (reviewId: string) => updateReviewStatus(reviewId, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['admin-review-stats'] })
      toast.success('Đã duyệt đánh giá')
    }
  })

  const rejectReviewMutation = useMutation({
    mutationFn: (reviewId: string) => updateReviewStatus(reviewId, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['admin-review-stats'] })
      toast.success('Đã từ chối đánh giá')
    }
  })

  const deleteReviewMutation = useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['admin-review-stats'] })
      toast.success('Đã xóa đánh giá')
    }
  })

  const replyMutation = useMutation({
    mutationFn: ({
      reviewId,
      message
    }: {
      reviewId: string
      message: string
    }) => replyToReview(reviewId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      setReplyDialogOpen(false)
      setReplyMessage('')
      toast.success('Đã gửi phản hồi')
    }
  })

  const bulkApproveMutation = useMutation({
    mutationFn: bulkApproveReviews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['admin-review-stats'] })
      setSelectedReviews([])
      toast.success('Đã duyệt hàng loạt')
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteReviews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['admin-review-stats'] })
      setSelectedReviews([])
      toast.success('Đã xóa hàng loạt')
    }
  })

  // Handlers
  const handleSelectReview = (reviewId: string) => {
    setSelectedReviews((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  const handleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([])
    } else {
      setSelectedReviews(reviews.map((r: any) => r._id))
    }
  }

  const handleReply = (review: Review) => {
    setSelectedReview(review)
    setReplyMessage(review.adminReply?.message || '')
    setReplyDialogOpen(true)
  }

  const handleDelete = (reviewId: string) => {
    if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      deleteReviewMutation.mutate(reviewId)
    }
  }

  const handleBulkApprove = () => {
    if (selectedReviews.length === 0) return
    bulkApproveMutation.mutate(selectedReviews)
  }

  const handleBulkDelete = () => {
    if (selectedReviews.length === 0) return
    if (confirm(`Xóa ${selectedReviews.length} đánh giá đã chọn?`)) {
      bulkDeleteMutation.mutate(selectedReviews)
    }
  }

  const reviews = reviewsData?.data?.reviews || []
  const stats = statsData?.data || {
    total: 0,
    pending: 0,
    approved: 0,
    averageRating: 0
  }
  const pagination = reviewsData?.data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quản lý đánh giá
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Duyệt và quản lý đánh giá sản phẩm từ khách hàng
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tổng đánh giá
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chờ duyệt
              </p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                {stats.pending}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Đã duyệt
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {stats.approved}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rating TB
              </p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                {stats.averageRating.toFixed(1)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm trong đánh giá..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as any)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
            </SelectContent>
          </Select>

          {/* Rating Filter */}
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả sao</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Đã chọn {selectedReviews.length} đánh giá
            </span>
            <Button size="sm" onClick={handleBulkApprove}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Duyệt hàng loạt
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa hàng loạt
            </Button>
          </div>
        )}
      </Card>

      {/* Reviews Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedReviews.length === reviews.length &&
                      reviews.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={8}>
                      <Skeleton className="h-16 w-full" />
                    </td>
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Không có đánh giá nào</p>
                  </td>
                </tr>
              ) : (
                reviews.map((review: any) => {
                  const product =
                    typeof review.product === 'object' ? review.product : null
                  const customer =
                    typeof review.customer === 'object' ? review.customer : null

                  return (
                    <tr
                      key={review._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedReviews.includes(review._id)}
                          onChange={() => handleSelectReview(review._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product && product.images && product.images[0] && (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                          )}
                          <div className="max-w-xs">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {product?.name || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {customer?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer?.email || ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'w-4 h-4',
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              )}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {review.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {review.comment}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {review.isApproved ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Đã duyệt
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                            <Clock className="w-3 h-3 mr-1" />
                            Chờ duyệt
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(review.createdAt), 'dd/MM/yyyy', {
                          locale: vi
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!review.isApproved && (
                              <DropdownMenuItem
                                onClick={() =>
                                  approveReviewMutation.mutate(review._id)
                                }
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Duyệt
                              </DropdownMenuItem>
                            )}
                            {review.isApproved && (
                              <DropdownMenuItem
                                onClick={() =>
                                  rejectReviewMutation.mutate(review._id)
                                }
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Từ chối
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleReply(review)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Phản hồi
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(review._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trang {pagination.page} / {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phản hồi đánh giá</DialogTitle>
            <DialogDescription>
              Gửi phản hồi của shop cho khách hàng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              placeholder="Nhập nội dung phản hồi..."
              rows={5}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setReplyDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  if (selectedReview && replyMessage.trim()) {
                    replyMutation.mutate({
                      reviewId: selectedReview._id,
                      message: replyMessage.trim()
                    })
                  }
                }}
                disabled={!replyMessage.trim() || replyMutation.isPending}
              >
                {replyMutation.isPending ? 'Đang gửi...' : 'Gửi phản hồi'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

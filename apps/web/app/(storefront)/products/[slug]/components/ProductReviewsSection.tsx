'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, MessageSquare, Edit2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import RatingDistribution from '@/src/components/reviews/RatingDistribution'
import ReviewList from '@/src/components/reviews/ReviewList'
import ReviewForm from '@/src/components/reviews/ReviewForm'
import { ReviewFiltersState } from '@/src/components/reviews/ReviewFilters'
import {
  getProductReviews,
  canReview,
  createReview,
  updateReview,
  deleteReview,
  voteHelpful,
  CreateReviewData,
  Review
} from '@/src/services/reviewsApi'
import { useAuthStore } from '@/src/store/authStore'
import { useRouter } from 'next/navigation'
// 👇 Import Toast xịn
import { toast } from 'sonner'

interface ProductReviewsSectionProps {
  productId: string
  productName: string
  className?: string
}

export default function ProductReviewsSection({
  productId,
  productName,
  className
}: ProductReviewsSectionProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const user = useAuthStore((state) => state.user)

  // State
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [filters, setFilters] = useState<ReviewFiltersState>({
    rating: null,
    sort: '-createdAt',
    search: '',
    hasImages: false,
    verifiedOnly: false
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Query: Get reviews
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['product-reviews', productId, filters, currentPage],
    queryFn: () =>
      getProductReviews(productId, {
        page: currentPage,
        limit: 10,
        rating: filters.rating || undefined,
        sort: filters.sort as any,
        verified: filters.verifiedOnly
      })
  })

  // Query: Check quyền review
  const { data: canReviewData, isLoading: isCheckingReview } = useQuery({
    queryKey: ['can-review', productId, user?._id],
    queryFn: () => canReview(productId),
    enabled: !!user,
    retry: false
  })

  // Mutation: Create review
  const createReviewMutation = useMutation({
    mutationFn: (data: CreateReviewData) => createReview(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['product-reviews', productId]
      })
      queryClient.invalidateQueries({ queryKey: ['can-review', productId] })
      setShowReviewForm(false)
      toast.success('Gửi đánh giá thành công! Vui lòng chờ duyệt.')
    },
    onError: (error: any) => {
      // 👇 Hiển thị lỗi Tiếng Việt từ Backend
      toast.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá'
      )
    }
  })

  // Mutation: Update review
  const updateReviewMutation = useMutation({
    mutationFn: ({
      reviewId,
      data
    }: {
      reviewId: string
      data: Partial<CreateReviewData>
    }) => updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['product-reviews', productId]
      })
      setEditingReview(null)
      setShowReviewForm(false)
      toast.success('Cập nhật đánh giá thành công!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  })

  // Mutation: Delete review
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['product-reviews', productId]
      })
      queryClient.invalidateQueries({ queryKey: ['can-review', productId] })
      toast.success('Đã xóa đánh giá thành công')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa đánh giá')
    }
  })

  // Mutation: Vote helpful
  const voteHelpfulMutation = useMutation({
    mutationFn: (reviewId: string) => voteHelpful(reviewId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ['product-reviews', productId]
      })
      toast.success(data.message || 'Đã bình chọn')
    },
    onError: () => {
      if (!user) {
        toast.error('Vui lòng đăng nhập để bình chọn', {
          action: {
            label: 'Đăng nhập',
            onClick: () =>
              router.push('/login?redirect=' + window.location.pathname)
          }
        })
      }
    }
  })

  // Handlers
  const handleWriteReview = () => {
    // 1. Check Login
    if (!user) {
      toast.info('Bạn cần đăng nhập để viết đánh giá', {
        action: {
          label: 'Đăng nhập ngay',
          onClick: () =>
            router.push('/login?redirect=' + window.location.pathname)
        }
      })
      return
    }

    // 2. Đang kiểm tra quyền
    if (isCheckingReview) {
      return
    }

    // 3. Check quyền (đã mua hàng chưa)
    // Nếu canReview = false -> Hiện lý do (Backend đã trả về Tiếng Việt)
    if (canReviewData && !canReviewData.canReview) {
      toast.warning(
        canReviewData.reason || 'Bạn cần mua sản phẩm này trước khi đánh giá.'
      )
      return
    }

    // 4. OK -> Mở form
    setEditingReview(null)
    setShowReviewForm(true)
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setShowReviewForm(true)
  }

  const handleDeleteReview = (reviewId: string) => {
    // Dùng window.confirm cho chắc chắn, hoặc thay bằng Custom Modal
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
      deleteReviewMutation.mutate(reviewId)
    }
  }

  const handleSubmitReview = (data: CreateReviewData) => {
    if (editingReview) {
      updateReviewMutation.mutate({ reviewId: editingReview._id, data })
    } else {
      createReviewMutation.mutate({
        ...data,
        orderId: canReviewData?.orderId || ''
      })
    }
  }

  // Safe Data Access
  const reviews = reviewsData?.data?.reviews || []
  const summary = reviewsData?.data?.summary || {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  }
  const pagination = reviewsData?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  }

  return (
    <section className={className}>
      {/* Section Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header Content */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Đánh giá sản phẩm
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {summary.totalReviews} đánh giá từ khách hàng
                </p>
              </div>
            </div>

            {/* Write Review Button */}
            <Button
              onClick={handleWriteReview}
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all"
              disabled={isCheckingReview}
            >
              {isCheckingReview ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Edit2 className="w-4 h-4 mr-2" />
              )}
              Viết đánh giá
            </Button>
          </div>
        </div>

        {/* Rating Distribution */}
        {summary.totalReviews > 0 && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
            <RatingDistribution
              averageRating={summary.averageRating}
              totalReviews={summary.totalReviews}
              distribution={summary.distribution}
              onFilterByRating={(rating) => {
                setFilters({ ...filters, rating })
                setCurrentPage(1)
              }}
              selectedRating={filters.rating}
            />
          </div>
        )}

        {/* Reviews List */}
        <div className="p-6">
          {summary.totalReviews === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có đánh giá nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Hãy là người đầu tiên đánh giá sản phẩm này
              </p>
              <Button
                onClick={handleWriteReview}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                Viết đánh giá ngay
              </Button>
            </div>
          ) : (
            <ReviewList
              reviews={reviews}
              totalReviews={summary.totalReviews}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              isLoading={isLoadingReviews}
              currentUserId={user?._id}
              filters={filters}
              onFiltersChange={(newFilters) => {
                setFilters(newFilters)
                setCurrentPage(1)
              }}
              onPageChange={setCurrentPage}
              onVoteHelpful={(reviewId) => voteHelpfulMutation.mutate(reviewId)}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              showFilters={true}
            />
          )}
        </div>
      </div>

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ReviewForm
            productName={productName}
            orderId={canReviewData?.orderId}
            initialData={
              editingReview
                ? {
                    rating: editingReview.rating,
                    title: editingReview.title,
                    comment: editingReview.comment,
                    pros: editingReview.pros,
                    cons: editingReview.cons
                  }
                : undefined
            }
            isSubmitting={
              createReviewMutation.isPending || updateReviewMutation.isPending
            }
            onSubmit={handleSubmitReview}
            onCancel={() => {
              setShowReviewForm(false)
              setEditingReview(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </section>
  )
}

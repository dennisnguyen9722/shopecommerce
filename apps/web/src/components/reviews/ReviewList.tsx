// src/components/reviews/ReviewList.tsx
'use client'

import React from 'react'
import { Loader2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import ReviewCard from './ReviewCard'
import ReviewFilters, { ReviewFiltersState } from './ReviewFilters'
import { Review } from '@/src/services/reviewsApi'
import { Skeleton } from '@/components/ui/skeleton'

interface ReviewListProps {
  reviews: Review[]
  totalReviews: number
  currentPage: number
  totalPages: number
  isLoading?: boolean
  currentUserId?: string
  filters: ReviewFiltersState
  onFiltersChange: (filters: ReviewFiltersState) => void
  onPageChange: (page: number) => void
  onVoteHelpful?: (reviewId: string) => void
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: string) => void
  showFilters?: boolean
  className?: string
}

export default function ReviewList({
  reviews,
  totalReviews,
  currentPage,
  totalPages,
  isLoading = false,
  currentUserId,
  filters,
  onFiltersChange,
  onPageChange,
  onVoteHelpful,
  onEdit,
  onDelete,
  showFilters = true,
  className
}: ReviewListProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <ReviewFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            totalCount={totalReviews}
          />
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <>
            {[...Array(3)].map((_, index) => (
              <ReviewCardSkeleton key={index} />
            ))}
          </>
        )}

        {/* Empty State */}
        {!isLoading && reviews.length === 0 && (
          <EmptyReviews
            hasFilters={
              filters.rating !== null ||
              filters.search !== '' ||
              filters.hasImages ||
              filters.verifiedOnly
            }
            onClearFilters={() =>
              onFiltersChange({
                rating: null,
                sort: '-createdAt',
                search: '',
                hasImages: false,
                verifiedOnly: false
              })
            }
          />
        )}

        {/* Reviews */}
        {!isLoading &&
          reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={currentUserId}
              onVoteHelpful={onVoteHelpful}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

// =========================================================
// SKELETON LOADING STATE
// =========================================================
function ReviewCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Content */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-20 w-full" />

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

// =========================================================
// EMPTY STATE
// =========================================================
interface EmptyReviewsProps {
  hasFilters: boolean
  onClearFilters: () => void
}

function EmptyReviews({ hasFilters, onClearFilters }: EmptyReviewsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>

        {hasFilters ? (
          <>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Không tìm thấy đánh giá nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Thử xóa bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
            </div>
            <Button variant="outline" onClick={onClearFilters}>
              Xóa bộ lọc
            </Button>
          </>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có đánh giá nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Hãy là người đầu tiên đánh giá sản phẩm này
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// =========================================================
// PAGINATION COMPONENT
// =========================================================
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5 // Số trang hiển thị tối đa

    if (totalPages <= showPages) {
      // Hiển thị tất cả nếu <= 5 pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Logic phức tạp hơn cho nhiều pages
      if (currentPage <= 3) {
        // Đầu danh sách
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Cuối danh sách
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Giữa danh sách
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Trước
      </Button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-gray-500 dark:text-gray-400"
            >
              ...
            </span>
          )
        }

        const pageNumber = page as number
        const isActive = pageNumber === currentPage

        return (
          <Button
            key={pageNumber}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
            className={cn(
              'min-w-10',
              isActive &&
                'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600'
            )}
          >
            {pageNumber}
          </Button>
        )
      })}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Sau
      </Button>
    </div>
  )
}

// =========================================================
// VARIANT: Infinite Scroll Version
// =========================================================
interface InfiniteReviewListProps {
  reviews: Review[]
  hasMore: boolean
  isLoading: boolean
  isFetchingMore: boolean
  currentUserId?: string
  onLoadMore: () => void
  onVoteHelpful?: (reviewId: string) => void
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: string) => void
  className?: string
}

export function InfiniteReviewList({
  reviews,
  hasMore,
  isLoading,
  isFetchingMore,
  currentUserId,
  onLoadMore,
  onVoteHelpful,
  onEdit,
  onDelete,
  className
}: InfiniteReviewListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Loading Initial */}
      {isLoading && reviews.length === 0 && (
        <>
          {[...Array(3)].map((_, index) => (
            <ReviewCardSkeleton key={index} />
          ))}
        </>
      )}

      {/* Reviews */}
      {reviews.map((review) => (
        <ReviewCard
          key={review._id}
          review={review}
          currentUserId={currentUserId}
          onVoteHelpful={onVoteHelpful}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isFetchingMore}
            className="min-w-[200px]"
          >
            {isFetchingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tải...
              </>
            ) : (
              'Xem thêm đánh giá'
            )}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && reviews.length === 0 && (
        <EmptyReviews hasFilters={false} onClearFilters={() => {}} />
      )}
    </div>
  )
}

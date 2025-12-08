// src/components/reviews/RatingDistribution.tsx
'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingDistributionProps {
  averageRating: number
  totalReviews: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  onFilterByRating?: (rating: number | null) => void
  selectedRating?: number | null
  className?: string
}

export default function RatingDistribution({
  averageRating,
  totalReviews,
  distribution,
  onFilterByRating,
  selectedRating,
  className
}: RatingDistributionProps) {
  const ratings = [5, 4, 3, 2, 1]

  // Tính phần trăm cho mỗi rating
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0
    return Math.round((count / totalReviews) * 100)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Average Rating Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        {/* Big Number */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 dark:text-white mb-1">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-5 h-5',
                  star <= Math.round(averageRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                )}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {totalReviews.toLocaleString()} đánh giá
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 space-y-2">
          {ratings.map((rating) => {
            const count = distribution[rating as keyof typeof distribution]
            const percentage = getPercentage(count)
            const isSelected = selectedRating === rating
            const isInteractive = !!onFilterByRating

            return (
              <button
                key={rating}
                onClick={() => onFilterByRating?.(isSelected ? null : rating)}
                disabled={!isInteractive}
                className={cn(
                  'w-full flex items-center gap-3 group',
                  isInteractive && 'cursor-pointer hover:opacity-80',
                  !isInteractive && 'cursor-default',
                  isSelected && 'opacity-100'
                )}
              >
                {/* Star Label */}
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {rating}
                  </span>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>

                {/* Progress Bar */}
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      isSelected
                        ? 'bg-blue-500'
                        : 'bg-yellow-400 group-hover:bg-yellow-500'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Count & Percentage */}
                <div className="w-20 text-right">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {count} ({percentage}%)
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter Clear Button */}
      {selectedRating && onFilterByRating && (
        <button
          onClick={() => onFilterByRating(null)}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          ✕ Xóa bộ lọc {selectedRating} sao
        </button>
      )}
    </div>
  )
}

// =========================================================
// VARIANT: Compact Version (for sidebar or small spaces)
// =========================================================
export function CompactRatingDistribution({
  averageRating,
  totalReviews,
  distribution,
  className
}: Omit<RatingDistributionProps, 'onFilterByRating' | 'selectedRating'>) {
  const ratings = [5, 4, 3, 2, 1]

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0
    return Math.round((count / totalReviews) * 100)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Average Rating */}
      <div className="flex items-center gap-3">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {averageRating.toFixed(1)}
        </div>
        <div>
          <div className="flex items-center gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-4 h-4',
                  star <= Math.round(averageRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                )}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {totalReviews.toLocaleString()} đánh giá
          </div>
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-1.5">
        {ratings.map((rating) => {
          const count = distribution[rating as keyof typeof distribution]
          const percentage = getPercentage(count)

          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-12">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {rating}
                </span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </div>

              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="w-10 text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {count}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

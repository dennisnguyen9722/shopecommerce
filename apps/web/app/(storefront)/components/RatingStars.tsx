'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  showNumber?: boolean
  totalReviews?: number
  onChange?: (rating: number) => void
  className?: string
}

export default function RatingStars({
  rating,
  size = 'md',
  interactive = false,
  showNumber = false,
  totalReviews,
  onChange,
  className
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(rating)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClick = (value: number) => {
    if (!interactive) return
    setSelectedRating(value)
    onChange?.(value)
  }

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  const displayRating = interactive ? hoverRating || selectedRating : rating

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = value <= displayRating
          const isPartial =
            value === Math.ceil(displayRating) && displayRating % 1 !== 0
          const fillPercentage = isPartial ? (displayRating % 1) * 100 : 100

          return (
            <button
              key={value}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'relative transition-transform',
                interactive && 'cursor-pointer hover:scale-110',
                !interactive && 'cursor-default'
              )}
            >
              {/* Background star (empty) */}
              <Star
                className={cn(
                  sizeClasses[size],
                  'text-gray-300',
                  interactive && hoverRating >= value && 'text-yellow-400'
                )}
                fill="currentColor"
              />

              {/* Foreground star (filled) */}
              {isFilled && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: isPartial ? `${fillPercentage}%` : '100%' }}
                >
                  <Star
                    className={cn(sizeClasses[size], 'text-yellow-400')}
                    fill="currentColor"
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Rating number & total reviews */}
      {showNumber && (
        <div className="flex items-center gap-1 text-sm">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {rating.toFixed(1)}
          </span>
          {totalReviews !== undefined && (
            <span className="text-gray-500 dark:text-gray-400">
              ({totalReviews.toLocaleString()})
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// =========================================================
// EXPORT VARIANT: Read-only rating display
// =========================================================
export function RatingDisplay({
  rating,
  totalReviews,
  size = 'md',
  className
}: {
  rating: number
  totalReviews?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <RatingStars
      rating={rating}
      size={size}
      showNumber
      totalReviews={totalReviews}
      className={className}
    />
  )
}

// =========================================================
// EXPORT VARIANT: Interactive rating input
// =========================================================
export function RatingInput({
  value,
  onChange,
  size = 'lg',
  className
}: {
  value: number
  onChange: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <RatingStars
      rating={value}
      size={size}
      interactive
      onChange={onChange}
      className={className}
    />
  )
}

// src/components/reviews/ReviewFilters.tsx
'use client'

import React from 'react'
import {
  Search,
  X,
  SlidersHorizontal,
  Star,
  Image,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
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

export interface ReviewFiltersState {
  rating: number | null
  sort: string
  search: string
  hasImages: boolean
  verifiedOnly: boolean
}

interface ReviewFiltersProps {
  filters: ReviewFiltersState
  onFiltersChange: (filters: ReviewFiltersState) => void
  totalCount?: number
  className?: string
}

export default function ReviewFilters({
  filters,
  onFiltersChange,
  totalCount,
  className
}: ReviewFiltersProps) {
  const handleRatingClick = (rating: number) => {
    onFiltersChange({
      ...filters,
      rating: filters.rating === rating ? null : rating
    })
  }

  const handleSortChange = (sort: string) => {
    onFiltersChange({ ...filters, sort })
  }

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search })
  }

  const handleToggleImages = () => {
    onFiltersChange({ ...filters, hasImages: !filters.hasImages })
  }

  const handleToggleVerified = () => {
    onFiltersChange({ ...filters, verifiedOnly: !filters.verifiedOnly })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      rating: null,
      sort: '-createdAt',
      search: '',
      hasImages: false,
      verifiedOnly: false
    })
  }

  const hasActiveFilters =
    filters.rating !== null ||
    filters.search !== '' ||
    filters.hasImages ||
    filters.verifiedOnly

  const activeFilterCount = [
    filters.rating !== null,
    filters.hasImages,
    filters.verifiedOnly,
    filters.search !== ''
  ].filter(Boolean).length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Title & Clear Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Lọc & Sắp xếp
          </h3>
          {totalCount !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {totalCount} đánh giá
            </Badge>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <X className="w-4 h-4 mr-1" />
            Xóa bộ lọc ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Tìm kiếm trong đánh giá..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {filters.search && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter by Rating */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Lọc theo số sao
        </label>
        <div className="flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const isSelected = filters.rating === rating

            return (
              <Button
                key={rating}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRatingClick(rating)}
                className={cn(
                  'gap-1',
                  isSelected &&
                    'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-700'
                )}
              >
                <span className="font-medium">{rating}</span>
                <Star
                  className={cn(
                    'w-4 h-4',
                    isSelected
                      ? 'fill-white text-white'
                      : 'fill-yellow-400 text-yellow-400'
                  )}
                />
              </Button>
            )
          })}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Bộ lọc nhanh
        </label>
        <div className="flex flex-wrap gap-2">
          {/* Has Images Filter */}
          <Button
            variant={filters.hasImages ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleImages}
            className={cn(
              'gap-2',
              filters.hasImages &&
                'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            )}
          >
            <Image className="w-4 h-4" />
            Có hình ảnh
          </Button>

          {/* Verified Purchase Filter */}
          <Button
            variant={filters.verifiedOnly ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleVerified}
            className={cn(
              'gap-2',
              filters.verifiedOnly &&
                'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
            )}
          >
            <CheckCircle className="w-4 h-4" />
            Đã mua hàng
          </Button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sắp xếp theo
        </label>
        <Select value={filters.sort} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn cách sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-createdAt">Mới nhất</SelectItem>
            <SelectItem value="createdAt">Cũ nhất</SelectItem>
            <SelectItem value="-helpful">Hữu ích nhất</SelectItem>
            <SelectItem value="-rating">Rating cao nhất</SelectItem>
            <SelectItem value="rating">Rating thấp nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Đang lọc:
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.rating !== null && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleRatingClick(filters.rating!)}
              >
                {filters.rating} sao
                <X className="w-3 h-3" />
              </Badge>
            )}

            {filters.hasImages && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={handleToggleImages}
              >
                Có hình ảnh
                <X className="w-3 h-3" />
              </Badge>
            )}

            {filters.verifiedOnly && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={handleToggleVerified}
              >
                Đã mua hàng
                <X className="w-3 h-3" />
              </Badge>
            )}

            {filters.search && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSearchChange('')}
              >
                Tìm kiếm: &ldquo;{filters.search.substring(0, 20)}
                {filters.search.length > 20 ? '...' : ''}&rdquo;
                <X className="w-3 h-3" />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// =========================================================
// VARIANT: Compact Filters (For mobile or small spaces)
// =========================================================
export function CompactReviewFilters({
  filters,
  onFiltersChange,
  className
}: Omit<ReviewFiltersProps, 'totalCount'>) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-2', className)}>
      {/* Sort Dropdown */}
      <Select
        value={filters.sort}
        onValueChange={(sort) => onFiltersChange({ ...filters, sort })}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="-createdAt">Mới nhất</SelectItem>
          <SelectItem value="-helpful">Hữu ích nhất</SelectItem>
          <SelectItem value="-rating">Rating cao</SelectItem>
          <SelectItem value="rating">Rating thấp</SelectItem>
        </SelectContent>
      </Select>

      {/* Quick Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filters.hasImages ? 'default' : 'outline'}
          size="sm"
          onClick={() =>
            onFiltersChange({ ...filters, hasImages: !filters.hasImages })
          }
        >
          <Image className="w-4 h-4" />
        </Button>

        <Button
          variant={filters.verifiedOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() =>
            onFiltersChange({
              ...filters,
              verifiedOnly: !filters.verifiedOnly
            })
          }
        >
          <CheckCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

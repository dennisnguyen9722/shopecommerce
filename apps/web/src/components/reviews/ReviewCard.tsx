// src/components/reviews/ReviewCard.tsx
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  Star,
  ThumbsUp,
  CheckCircle,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Review } from '@/src/services/reviewsApi'

interface ReviewCardProps {
  review: Review
  currentUserId?: string
  onVoteHelpful?: (reviewId: string) => void
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: string) => void
  showActions?: boolean
  className?: string
}

export default function ReviewCard({
  review,
  currentUserId,
  onVoteHelpful,
  onEdit,
  onDelete,
  showActions = true,
  className
}: ReviewCardProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const isOwnReview =
    currentUserId &&
    (typeof review.customer === 'object'
      ? review.customer._id === currentUserId
      : review.customer === currentUserId)

  const customerName =
    typeof review.customer === 'object' ? review.customer.name : 'Khách hàng'

  const hasVoted = currentUserId && review.helpfulVotes?.includes(currentUserId)

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setImageModalOpen(true)
  }

  return (
    <>
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4',
          className
        )}
      >
        {/* Header: Avatar, Name, Rating, Date */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Avatar */}
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                {customerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Name & Verified Badge */}
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {customerName}
                </h4>
                {review.isVerifiedPurchase && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Đã mua hàng
                  </Badge>
                )}
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'w-4 h-4',
                        star <= review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                {format(new Date(review.createdAt), 'dd MMM yyyy', {
                  locale: vi
                })}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {showActions && isOwnReview && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(review)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(review._id)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Review Title */}
        {review.title && (
          <h5 className="font-semibold text-gray-900 dark:text-white">
            {review.title}
          </h5>
        )}

        {/* Review Comment */}
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {review.comment}
        </p>

        {/* Pros & Cons */}
        {((review.pros && review.pros.length > 0) ||
          (review.cons && review.cons.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Pros */}
            {review.pros && review.pros.length > 0 && (
              <div className="space-y-2">
                <h6 className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span>👍</span> Ưu điểm
                </h6>
                <ul className="space-y-1">
                  {review.pros.map((pro, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                    >
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {review.cons && review.cons.length > 0 && (
              <div className="space-y-2">
                <h6 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span>👎</span> Nhược điểm
                </h6>
                <ul className="space-y-1">
                  {review.cons.map((con, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                    >
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {review.images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(image)}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity"
              >
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Admin Reply */}
        {review.adminReply && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Phản hồi từ Shop
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {format(
                      new Date(review.adminReply.repliedAt),
                      'dd MMM yyyy',
                      { locale: vi }
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {review.adminReply.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer: Helpful Vote */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {review.helpfulCount > 0 && (
              <span>{review.helpfulCount} người thấy hữu ích</span>
            )}
          </div>

          {onVoteHelpful && currentUserId && !isOwnReview && (
            <Button
              variant={hasVoted ? 'default' : 'outline'}
              size="sm"
              onClick={() => onVoteHelpful(review._id)}
              className={cn(
                'gap-2',
                hasVoted &&
                  'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600'
              )}
            >
              <ThumbsUp className="w-4 h-4" />
              {hasVoted ? 'Đã thấy hữu ích' : 'Hữu ích'}
            </Button>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <button
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-light"
          >
            ×
          </button>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedImage}
              alt="Review image"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}

// src/components/reviews/ReviewForm.tsx
'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, Plus, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RatingInput } from '@/app/(storefront)/components/RatingStars'
import { CreateReviewData } from '@/src/services/reviewsApi'

interface ReviewFormProps {
  productName?: string
  orderId?: string
  initialData?: Partial<CreateReviewData>
  isSubmitting?: boolean
  onSubmit: (data: CreateReviewData) => void
  onCancel?: () => void
  className?: string
}

interface FormData {
  rating: number
  title: string
  comment: string
  pros: string[]
  cons: string[]
}

export default function ReviewForm({
  productName,
  orderId = '',
  initialData,
  isSubmitting = false,
  onSubmit,
  onCancel,
  className
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 5)
  const [pros, setPros] = useState<string[]>(initialData?.pros || [])
  const [cons, setCons] = useState<string[]>(initialData?.cons || [])
  const [newPro, setNewPro] = useState('')
  const [newCon, setNewCon] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title || '',
      comment: initialData?.comment || ''
    }
  })

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (images.length + files.length > 5) {
      alert('Tối đa 5 ảnh')
      return
    }

    // Validate file size (max 5MB per image)
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} quá lớn (tối đa 5MB)`)
        return false
      }
      return true
    })

    setImages((prev) => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Add Pro
  const handleAddPro = () => {
    if (newPro.trim() && pros.length < 5) {
      setPros([...pros, newPro.trim()])
      setNewPro('')
    }
  }

  // Remove Pro
  const handleRemovePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index))
  }

  // Add Con
  const handleAddCon = () => {
    if (newCon.trim() && cons.length < 5) {
      setCons([...cons, newCon.trim()])
      setNewCon('')
    }
  }

  // Remove Con
  const handleRemoveCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index))
  }

  // Submit handler
  const onFormSubmit = (data: FormData) => {
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá')
      return
    }

    onSubmit({
      rating,
      title: data.title,
      comment: data.comment,
      pros: pros.length > 0 ? pros : undefined,
      cons: cons.length > 0 ? cons : undefined,
      orderId,
      images: images.length > 0 ? images : undefined
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6',
        className
      )}
    >
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {initialData ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
        </h3>
        {productName && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sản phẩm: <span className="font-medium">{productName}</span>
          </p>
        )}
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">
          Đánh giá của bạn <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-4">
          <RatingInput value={rating} onChange={setRating} size="lg" />
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            {rating === 5 && '🤩 Tuyệt vời'}
            {rating === 4 && '😊 Hài lòng'}
            {rating === 3 && '😐 Bình thường'}
            {rating === 2 && '😕 Không hài lòng'}
            {rating === 1 && '😞 Rất tệ'}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Tiêu đề <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Tóm tắt đánh giá của bạn"
          {...register('title', {
            required: 'Vui lòng nhập tiêu đề',
            maxLength: { value: 200, message: 'Tối đa 200 ký tự' }
          })}
          className={cn(errors.title && 'border-red-500')}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">
          Nhận xét chi tiết <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="comment"
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
          rows={5}
          {...register('comment', {
            required: 'Vui lòng nhập nhận xét',
            minLength: { value: 20, message: 'Tối thiểu 20 ký tự' },
            maxLength: { value: 2000, message: 'Tối đa 2000 ký tự' }
          })}
          className={cn(errors.comment && 'border-red-500')}
        />
        {errors.comment && (
          <p className="text-sm text-red-500">{errors.comment.message}</p>
        )}
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-green-600 dark:text-green-400">
            👍 Ưu điểm (Tùy chọn)
          </Label>

          <div className="flex gap-2">
            <Input
              placeholder="Nhập ưu điểm..."
              value={newPro}
              onChange={(e) => setNewPro(e.target.value)}
              onKeyPress={(e) =>
                e.key === 'Enter' && (e.preventDefault(), handleAddPro())
              }
              disabled={pros.length >= 5}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleAddPro}
              disabled={!newPro.trim() || pros.length >= 5}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {pros.length > 0 && (
            <ul className="space-y-2">
              {pros.map((pro, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded"
                >
                  <span className="text-green-600 dark:text-green-400 mt-0.5">
                    •
                  </span>
                  <span className="flex-1 text-gray-700 dark:text-gray-300">
                    {pro}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePro(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {pros.length >= 5 && (
            <p className="text-xs text-gray-500">Tối đa 5 ưu điểm</p>
          )}
        </div>

        {/* Cons */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-red-600 dark:text-red-400">
            👎 Nhược điểm (Tùy chọn)
          </Label>

          <div className="flex gap-2">
            <Input
              placeholder="Nhập nhược điểm..."
              value={newCon}
              onChange={(e) => setNewCon(e.target.value)}
              onKeyPress={(e) =>
                e.key === 'Enter' && (e.preventDefault(), handleAddCon())
              }
              disabled={cons.length >= 5}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleAddCon}
              disabled={!newCon.trim() || cons.length >= 5}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {cons.length > 0 && (
            <ul className="space-y-2">
              {cons.map((con, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded"
                >
                  <span className="text-red-600 dark:text-red-400 mt-0.5">
                    •
                  </span>
                  <span className="flex-1 text-gray-700 dark:text-gray-300">
                    {con}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCon(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {cons.length >= 5 && (
            <p className="text-xs text-gray-500">Tối đa 5 nhược điểm</p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">
          Thêm hình ảnh (Tùy chọn)
        </Label>
        <p className="text-xs text-gray-500">
          Tối đa 5 ảnh, mỗi ảnh tối đa 5MB
        </p>

        <div className="flex flex-wrap gap-3">
          {/* Image Previews */}
          {imagePreviews.map((preview, index) => (
            <div
              key={index}
              className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Upload Button */}
          {images.length < 5 && (
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Tải ảnh</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang gửi...
            </>
          ) : initialData ? (
            'Cập nhật'
          ) : (
            'Gửi đánh giá'
          )}
        </Button>
      </div>
    </form>
  )
}

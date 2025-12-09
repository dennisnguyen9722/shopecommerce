/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useRef } from 'react'
import serverApi from '@/src/lib/api'
import Image from 'next/image'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Camera,
  MessageCircle,
  UserCheck,
  X,
  ImageIcon
} from 'lucide-react'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Import Auth Store
import { useAuthStore } from '@/src/store/authStore'

// Định nghĩa kiểu dữ liệu
interface Reply {
  adminName: string
  content: string
  createdAt: string
}

interface Review {
  _id: string
  rating: number
  content: string
  images: string[]
  customerName?: string
  customerEmail?: string
  isAnonymous: boolean
  likes: number
  dislikes: number
  createdAt: string
  replies: Reply[]
}

interface Summary {
  average: number
  total: number
  stats: { _id: number; count: number }[]
}

export default function ReviewSection({ productId }: { productId: string }) {
  const { user } = useAuthStore()

  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  // ⭐ UPLOAD STATE (Áp dụng logic từ Admin)
  const [images, setImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '')
      setCustomerEmail(user.email || '')
    }
  }, [user])

  // -------------------------------
  // FETCH DATA
  // -------------------------------
  const fetchData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true)
      const [resReviews, resSummary] = await Promise.all([
        serverApi.get(`/public/reviews/${productId}`),
        serverApi.get(`/public/reviews/${productId}/summary`)
      ])
      setReviews(resReviews.data?.reviews || [])
      setSummary(resSummary.data || null)
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      fetchData(true)
    }, 5000)
    return () => clearInterval(interval)
  }, [productId])

  // -------------------------------
  // ⭐ UPLOAD LOGIC (Reuse từ Admin ImageUploader)
  // -------------------------------
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Limit 5 ảnh
    if (images.length + files.length > 5) {
      toast.error('Tối đa 5 ảnh thôi bạn nhé!')
      return
    }

    setIsUploading(true)
    const uploadedUrls: string[] = []

    try {
      // Config lấy từ file Admin bạn gửi
      const CLOUD_NAME = 'de3olloc4'
      const UPLOAD_PRESET = 'ecommerce_preset'

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', UPLOAD_PRESET)
        formData.append('folder', 'ecommerce/reviews') // Gom vào folder reviews cho gọn

        // Gọi API Cloudinary
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        )

        const data = await res.json()

        if (data.secure_url) {
          uploadedUrls.push(data.secure_url)
        } else {
          console.error('Upload failed detail:', data)
          toast.error(`Lỗi tải ảnh: ${file.name}`)
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls])
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Có lỗi xảy ra khi upload ảnh')
    } finally {
      setIsUploading(false)
      // Reset input để chọn lại file cũ được
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  // -------------------------------
  // ACTIONS
  // -------------------------------
  const reactToReview = async (id: string, type: 'like' | 'dislike') => {
    try {
      await serverApi.post(`/public/reviews/${id}/react`, { type })
      fetchData(true)
    } catch (e) {
      toast.error('Không thể thực hiện hành động')
    }
  }

  const submitReview = async () => {
    if (!content.trim()) return toast.error('Vui lòng nhập nội dung đánh giá')
    if (!rating) return toast.error('Vui lòng chọn số sao')

    if (!user && (!customerName.trim() || !customerEmail.trim())) {
      return toast.error('Vui lòng nhập đầy đủ họ tên và email')
    }

    setIsSubmitting(true)
    try {
      await serverApi.post('/public/reviews', {
        productId,
        rating,
        content,
        images, // Gửi mảng string URL lên
        customerName,
        customerEmail,
        isAnonymous
      })
      toast.success('Đánh giá đã gửi thành công!')

      setContent('')
      setImages([])
      setRating(5)
      if (!user) {
        setCustomerName('')
        setCustomerEmail('')
      }
      fetchData(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Lỗi gửi đánh giá')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (count: number, size = 16) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={`${
              i < count
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full bg-white text-gray-900 antialiased">
      <div className="py-10 space-y-12 max-w-5xl mx-auto px-4 md:px-0">
        {/* 1. THỐNG KÊ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 flex flex-col items-center justify-center p-6 bg-orange-50 border border-orange-100 rounded-2xl text-center">
            <div className="text-6xl font-extrabold text-orange-600">
              {summary?.average || 0}
              <span className="text-2xl text-orange-400 font-medium">/5</span>
            </div>
            <div className="my-3">
              {renderStars(Math.round(summary?.average || 0), 24)}
            </div>
            <p className="text-gray-500 font-medium">
              Dựa trên {summary?.total || 0} đánh giá
            </p>
          </div>
          <div className="col-span-1 md:col-span-2 flex flex-col justify-center gap-3 px-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const stat = summary?.stats.find((x) => x._id === star)
              const count = stat ? stat.count : 0
              const percent = summary?.total ? (count / summary.total) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-12 text-sm font-medium text-gray-700">
                    {star} <Star size={12} className="fill-black text-black" />
                  </div>
                  <Progress
                    value={percent}
                    className="h-2.5 flex-1 bg-gray-100 [&>div]:bg-orange-500"
                  />
                  <span className="w-8 text-xs text-gray-500 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* 2. FORM ĐÁNH GIÁ */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-gray-900">
            Gửi đánh giá của bạn
          </h3>

          <div className="space-y-6">
            {/* Chọn sao */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Bạn cảm thấy sản phẩm thế nào?
              </label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={`${
                        rating >= i + 1
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-lg font-medium text-orange-600">
                  {rating === 5 ? 'Tuyệt vời!' : rating === 1 ? 'Rất tệ' : ''}
                </span>
              </div>
            </div>

            {/* Nội dung & Upload Ảnh */}
            <div className="space-y-4">
              <Textarea
                placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm của bạn..."
                className="min-h-[120px] resize-none text-base bg-white border-gray-300 text-gray-900 focus-visible:ring-orange-500 placeholder:text-gray-400"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* LIST ẢNH ĐÃ UPLOAD */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 group">
                      <Image
                        src={img}
                        alt="preview"
                        fill
                        className="object-cover rounded-md border border-gray-300"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {isUploading && (
                    <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-md border border-gray-300">
                      <Loader2 className="animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />

              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-gray-500 border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || images.length >= 5}
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
                {isUploading ? 'Đang tải ảnh...' : 'Thêm hình ảnh thực tế'}
              </Button>
            </div>

            {/* THÔNG TIN USER */}
            {user ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  {user.avatar && <AvatarImage src={user.avatar} />}
                  <AvatarFallback className="bg-blue-600 text-white font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-blue-900 text-lg">
                      {user.name}
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200 flex items-center gap-1 uppercase tracking-wider">
                      <UserCheck size={10} /> Thành viên
                    </span>
                  </div>
                  <p className="text-sm text-blue-600/80 font-medium">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Họ tên
                  </label>
                  <Input
                    className="bg-white border-gray-300 text-gray-900 focus-visible:ring-orange-500"
                    placeholder="Nhập họ tên của bạn"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email (để nhận phản hồi)
                  </label>
                  <Input
                    className="bg-white border-gray-300 text-gray-900 focus-visible:ring-orange-500"
                    placeholder="example@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 bg-white cursor-pointer"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label
                  htmlFor="anonymous"
                  className="text-sm font-medium leading-none cursor-pointer text-gray-700 select-none"
                >
                  Đánh giá ẩn danh
                </label>
              </div>
              <Button
                size="lg"
                className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-orange-200 shadow-lg transition-all active:scale-95"
                onClick={submitReview}
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Gửi đánh giá
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* 3. LIST ĐÁNH GIÁ */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-gray-900">
            Khách hàng nói gì ({reviews.length})
          </h3>
          {loading && reviews.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">
                Chưa có đánh giá nào. Hãy là người đầu tiên!
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="group relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-gray-200">
                        <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                          {rev.isAnonymous ? 'A' : rev.customerName?.[0] || 'K'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {rev.isAnonymous
                            ? 'Người dùng ẩn danh'
                            : rev.customerName || 'Khách hàng'}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>
                            {format(
                              new Date(rev.createdAt),
                              'HH:mm dd/MM/yyyy',
                              { locale: vi }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {renderStars(rev.rating)}
                    </div>
                  </div>
                  <div className="pl-[52px]">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                      {rev.content}
                    </p>
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {rev.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200"
                          >
                            {/* Xử lý hiển thị cả string URL hoặc object URL */}
                            <Image
                              src={
                                typeof img === 'string' ? img : (img as any).url
                              }
                              alt="review"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                        onClick={() => reactToReview(rev._id, 'like')}
                      >
                        <ThumbsUp size={14} />
                        <span className="text-xs">
                          {rev.likes || 0} Hữu ích
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100"
                        onClick={() => reactToReview(rev._id, 'dislike')}
                      >
                        <ThumbsDown size={14} />
                      </Button>
                    </div>
                    {rev.replies && rev.replies.length > 0 && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                        {rev.replies.map((reply, index) => (
                          <div key={index}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                {reply.adminName || 'Admin'}
                                <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] uppercase font-bold tracking-wider">
                                  QTV
                                </span>
                              </span>
                              <span className="text-xs text-gray-400">
                                {format(
                                  new Date(reply.createdAt),
                                  'dd/MM/yyyy',
                                  { locale: vi }
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

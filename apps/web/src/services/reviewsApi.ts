import api from '@/src/lib/serverApi'

// =========================================================
// TYPES (Đã sửa lại cho khớp với Component)
// =========================================================

// 1. Sửa Review: Đổi customerId -> customer
export interface Review {
  _id: string
  product:
    | string
    | { _id: string; name: string; slug: string; images: { url: string }[] }
  customer:
    | {
        // 👈 Sửa thành 'customer' để khớp với ReviewCard
        _id: string
        name: string
        email: string
        avatar?: string
      }
    | string
  rating: number
  title?: string
  comment: string
  images: string[]
  pros?: string[]
  cons?: string[]
  isVerifiedPurchase?: boolean
  isApproved: boolean
  status?: 'pending' | 'approved' | 'rejected'
  helpfulCount: number
  helpfulVotes: string[]
  adminReply?: {
    message: string
    repliedAt: string
  }
  createdAt: string
  updatedAt: string
}

export interface ReviewSummary {
  averageRating: number
  totalReviews: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

// 2. Sửa Response: Thêm wrapper 'data' để khớp với logic reviewsData?.data?.summary
export interface ReviewsResponse {
  success: boolean
  data: {
    reviews: Review[]
    summary: ReviewSummary
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface CreateReviewData {
  rating: number
  title: string
  comment: string
  pros?: string[]
  cons?: string[]
  orderId?: string
  images?: File[]
}

export interface CanReviewResponse {
  canReview: boolean
  orderId?: string
  reason?: string
}

// =========================================================
// 🟢 PUBLIC API - KHÁCH HÀNG
// =========================================================

export const getProductReviews = async (
  productId: string,
  params?: any
): Promise<ReviewsResponse> => {
  const res = await api.get(`/public/reviews/${productId}`, { params })
  return res.data // Trả về nguyên cục { success, data: { reviews, summary... } }
}

export const canReview = async (
  productId: string
): Promise<CanReviewResponse> => {
  const { data } = await api.get(`/public/reviews/can-review/${productId}`)
  return data
}

export const createReview = async (
  productId: string,
  reviewData: CreateReviewData
): Promise<any> => {
  const formData = new FormData()
  formData.append('productId', productId)
  formData.append('rating', reviewData.rating.toString())
  formData.append('title', reviewData.title)
  formData.append('comment', reviewData.comment)
  if (reviewData.orderId) formData.append('orderId', reviewData.orderId)
  if (reviewData.pros) formData.append('pros', JSON.stringify(reviewData.pros))
  if (reviewData.cons) formData.append('cons', JSON.stringify(reviewData.cons))
  if (reviewData.images) {
    reviewData.images.forEach((image) => formData.append('images', image))
  }

  const { data } = await api.post(`/public/reviews`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export const voteHelpful = async (reviewId: string): Promise<any> => {
  const { data } = await api.post(`/public/reviews/${reviewId}/helpful`)
  return data
}

export const updateReview = async (
  reviewId: string,
  reviewData: Partial<CreateReviewData>
) => {
  const { data } = await api.put(`/public/reviews/${reviewId}`, reviewData)
  return data
}

export const deleteReview = async (reviewId: string) => {
  const { data } = await api.delete(`/public/reviews/${reviewId}`)
  return data
}

// =========================================================
// 🔴 ADMIN API - QUẢN TRỊ VIÊN (Bổ sung đầy đủ)
// =========================================================

// 3. Sửa params: Thêm 'sortBy'
export const getAdminReviews = async (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  rating?: number
  sortBy?: string // 👈 Thêm cái này để hết lỗi ở trang Admin
}) => {
  const { data } = await api.get('/admin/reviews', { params })
  return data
}

export const getReviewStats = async () => {
  const { data } = await api.get('/admin/reviews/stats')
  return data
}

// 4. Sửa tên hàm: Thêm alias updateReviewStatus cho Admin dùng
export const updateReviewStatus = async (
  reviewId: string,
  isApproved: boolean
) => {
  const { data } = await api.patch(`/admin/reviews/${reviewId}/status`, {
    isApproved
  })
  return data
}

export const replyToReview = async (reviewId: string, message: string) => {
  const { data } = await api.post(`/admin/reviews/${reviewId}/reply`, {
    message
  })
  return data
}

export const deleteAdminReview = async (reviewId: string) => {
  const { data } = await api.delete(`/admin/reviews/${reviewId}`)
  return data
}

export const bulkApproveReviews = async (reviewIds: string[]) => {
  const { data } = await api.post('/admin/reviews/bulk-approve', { reviewIds })
  return data
}

// 5. Thêm alias bulkDeleteReviews
export const bulkDeleteReviews = async (reviewIds: string[]) => {
  const { data } = await api.post('/admin/reviews/bulk-delete', { reviewIds })
  return data
}

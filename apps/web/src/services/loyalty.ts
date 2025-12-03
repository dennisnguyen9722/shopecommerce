// src/lib/api/loyalty.ts
import api from '@/src/lib/api'

export const loyaltyApi = {
  // Lấy thông tin tổng quan (Dashboard)
  getDashboard: async () => {
    const res = await api.get('/public/loyalty/dashboard')
    return res.data
  },

  // Lấy lịch sử điểm
  getHistory: async (page = 1, limit = 10) => {
    const res = await api.get(
      `/public/loyalty/history?page=${page}&limit=${limit}`
    )
    return res.data
  },

  // Lấy danh sách quà đổi
  getRewards: async () => {
    const res = await api.get('/public/loyalty/rewards')
    return res.data
  },

  // Thực hiện đổi quà
  redeemReward: async (rewardId: string) => {
    const res = await api.post('/public/loyalty/redeem', { rewardId })
    return res.data
  },

  // Lấy voucher của tôi
  getMyVouchers: async (status?: string) => {
    const url = status
      ? `/public/loyalty/vouchers?status=${status}`
      : '/public/loyalty/vouchers'
    const res = await api.get(url)
    return res.data
  },

  // Lấy thông tin quyền lợi các tier
  getTierBenefits: async () => {
    const res = await api.get('/public/loyalty/tier-benefits')
    return res.data
  },

  // ⭐ Validate voucher ở trang checkout
  validateVoucher: async (code: string, subtotal: number, email?: string) => {
    try {
      const res = await api.post('/public/orders/validate-voucher', {
        voucherCode: code,
        subtotal,
        customerEmail: email
      })
      return {
        success: true,
        data: res.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Lỗi khi validate voucher'
      }
    }
  },

  // ⭐ Preview order (xem trước tổng tiền + điểm sẽ nhận)
  previewOrder: async (items: any[], email?: string, voucherCode?: string) => {
    try {
      const res = await api.post('/public/orders/preview', {
        items,
        customerEmail: email,
        voucherCode
      })
      return {
        success: true,
        data: res.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Lỗi khi preview order'
      }
    }
  },

  // Theo dõi đơn hàng (Public)
  trackOrder: async (email: string, orderNumber: string) => {
    const res = await api.post('/public/orders/track', { email, orderNumber })
    return res.data
  }
}

// Type definitions cho response
export interface VoucherValidation {
  valid: boolean
  discount: number
  discountAmount: number
  code: string
  type: 'discount_percentage' | 'discount_fixed' | 'free_shipping'
  reward: {
    name: string
    type: string
    value: number | string
  }
}

export interface OrderPreview {
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  pointsWillEarn: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  voucherInfo: {
    name: string
    type: string
    discount: number
  } | null
  message: string
}

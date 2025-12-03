export interface IReward {
  _id: string
  name: string
  description: string
  pointsRequired: number
  type: 'discount_percentage' | 'discount_fixed' | 'free_shipping' | 'gift'
  value: any
  minOrderValue?: number
  maxDiscountAmount?: number
  tierRequired?: 'bronze' | 'silver' | 'gold' | 'platinum'
  imageUrl?: string
  stock?: number
  canRedeem?: boolean
  reason?: string
}

export interface IPointHistory {
  _id: string
  points: number
  type: 'earn' | 'redeem' | 'bonus' | 'expire' | 'refund' | 'admin_adjust'
  description: string
  createdAt: string
  orderId?: {
    orderNumber: string
    totalPrice: number
  }
}

export interface IVoucher {
  _id: string
  voucherCode: string
  status: 'active' | 'used' | 'expired'
  expiresAt: string
  rewardId: IReward
}

export interface ITierBenefit {
  tier: string
  multiplier: number
  discount: number
  freeShippingThreshold: number
  description: string[]
}

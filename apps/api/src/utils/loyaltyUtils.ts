// utils/loyaltyUtils.ts
import Customer from '../models/Customer'
import PointsHistory from '../models/PointsHistory'
import crypto from 'crypto'

// Tier thresholds (based on lifetime spent in VND)
export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 5_000_000, // 5 triệu
  gold: 10_000_000, // 10 triệu
  platinum: 20_000_000 // 20 triệu
}

// Points multiplier by tier
export const TIER_MULTIPLIERS = {
  bronze: 1,
  silver: 1.2,
  gold: 1.5,
  platinum: 2
}

// Base points earning rate: 1 point per 10,000 VND
export const POINTS_PER_VND = 10_000

/**
 * Calculate tier based on lifetime spent (giống với Customer model)
 */
export function calculateTier(
  totalSpent: number
): 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (totalSpent >= TIER_THRESHOLDS.platinum) return 'platinum'
  if (totalSpent >= TIER_THRESHOLDS.gold) return 'gold'
  if (totalSpent >= TIER_THRESHOLDS.silver) return 'silver'
  return 'bronze'
}

/**
 * Calculate points to earn from an order
 */
export function calculatePointsFromOrder(
  orderTotal: number,
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
): number {
  const basePoints = Math.floor(orderTotal / POINTS_PER_VND)
  const multiplier = TIER_MULTIPLIERS[tier]
  return Math.floor(basePoints * multiplier)
}

/**
 * Get points needed to reach next tier
 */
export function getPointsToNextTier(
  currentTier: string,
  totalSpent: number
): { nextTier: string | null; spentNeeded: number } {
  const tiers = ['bronze', 'silver', 'gold', 'platinum']
  const currentIndex = tiers.indexOf(currentTier)

  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return { nextTier: null, spentNeeded: 0 }
  }

  const nextTier = tiers[currentIndex + 1]
  const nextThreshold =
    TIER_THRESHOLDS[nextTier as keyof typeof TIER_THRESHOLDS]
  const spentNeeded = Math.max(0, nextThreshold - totalSpent)

  return { nextTier, spentNeeded }
}

/**
 * Award points to customer
 */
export async function awardPoints(
  customerId: string,
  points: number,
  type: 'earn' | 'bonus' | 'refund' | 'admin_adjust',
  description: string,
  metadata?: any
): Promise<void> {
  const customer = await Customer.findById(customerId)
  if (!customer) throw new Error('Customer not found')

  // Update customer points
  customer.loyaltyPoints += points
  await customer.save()

  // Log history
  await PointsHistory.create({
    customerId,
    points,
    type,
    description,
    metadata
  })
}

/**
 * Deduct points from customer
 */
export async function deductPoints(
  customerId: string,
  points: number,
  type: 'redeem' | 'expire',
  description: string,
  metadata?: any
): Promise<void> {
  const customer = await Customer.findById(customerId)
  if (!customer) throw new Error('Customer not found')

  if (customer.loyaltyPoints < points) {
    throw new Error('Insufficient points')
  }

  // Update customer points
  customer.loyaltyPoints -= points
  await customer.save()

  // Log history
  await PointsHistory.create({
    customerId,
    points: -points,
    type,
    description,
    metadata
  })
}

/**
 * Generate unique voucher code
 * @param prefix Tiền tố mã (VD: SALE50, TET2024)
 */
export function generateVoucherCode(prefix: string = 'REWARD'): string {
  // Random 3 byte hex = 6 ký tự (VD: A1B2C3)
  const random = crypto.randomBytes(3).toString('hex').toUpperCase()
  // Kết quả: SALE50-A1B2C3
  return `${prefix}-${random}`
}

/**
 * Get tier benefits description
 */
export function getTierBenefits(tier: string): {
  multiplier: number
  discount: number
  freeShippingThreshold: number
  description: string[]
} {
  const benefits: Record<string, any> = {
    bronze: {
      multiplier: 1,
      discount: 0,
      freeShippingThreshold: 500_000,
      description: [
        'Tích điểm x1 cho mọi giao dịch',
        'Miễn phí vận chuyển cho đơn từ 500K',
        'Ưu đãi sinh nhật'
      ]
    },
    silver: {
      multiplier: 1.2,
      discount: 3,
      freeShippingThreshold: 400_000,
      description: [
        'Tích điểm x1.2 cho mọi giao dịch',
        'Giảm giá 3% cho tất cả sản phẩm',
        'Miễn phí vận chuyển cho đơn từ 400K',
        'Ưu tiên hỗ trợ khách hàng',
        'Quà tặng sinh nhật cao cấp'
      ]
    },
    gold: {
      multiplier: 1.5,
      discount: 5,
      freeShippingThreshold: 300_000,
      description: [
        'Tích điểm x1.5 cho mọi giao dịch',
        'Giảm giá 5% cho tất cả sản phẩm',
        'Miễn phí vận chuyển cho đơn từ 300K',
        'Truy cập sớm sản phẩm mới',
        'Ưu tiên hỗ trợ VIP',
        'Quà tặng sinh nhật VIP'
      ]
    },
    platinum: {
      multiplier: 2,
      discount: 10,
      freeShippingThreshold: 0,
      description: [
        'Tích điểm x2 cho mọi giao dịch',
        'Giảm giá 10% cho tất cả sản phẩm',
        'Miễn phí vận chuyển không giới hạn',
        'Truy cập độc quyền sản phẩm limited',
        'Quản lý tài khoản chuyên trách',
        'Sự kiện và ưu đãi đặc biệt',
        'Quà tặng sinh nhật platinum'
      ]
    }
  }

  return benefits[tier] || benefits.bronze
}

/**
 * Format currency (VND)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

/**
 * Check if reward is available for customer
 */
export function canRedeemReward(
  reward: any,
  customer: any
): { canRedeem: boolean; reason?: string } {
  // Check points
  if (customer.loyaltyPoints < reward.pointsRequired) {
    return {
      canRedeem: false,
      reason: `Cần thêm ${reward.pointsRequired - customer.loyaltyPoints} điểm`
    }
  }

  // Check tier requirement
  if (reward.tierRequired) {
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum']
    const customerTierIndex = tierOrder.indexOf(customer.loyaltyTier)
    const requiredTierIndex = tierOrder.indexOf(reward.tierRequired)

    if (customerTierIndex < requiredTierIndex) {
      return {
        canRedeem: false,
        reason: `Chỉ dành cho hạng ${reward.tierRequired} trở lên`
      }
    }
  }

  // Check stock
  if (reward.stock !== undefined && reward.stock <= 0) {
    return { canRedeem: false, reason: 'Phần thưởng đã hết' }
  }

  // Check validity period
  const now = new Date()
  if (reward.validFrom && now < new Date(reward.validFrom)) {
    return { canRedeem: false, reason: 'Phần thưởng chưa có hiệu lực' }
  }

  if (reward.validUntil && now > new Date(reward.validUntil)) {
    return { canRedeem: false, reason: 'Phần thưởng đã hết hạn' }
  }

  // Check if active
  if (!reward.isActive) {
    return { canRedeem: false, reason: 'Phần thưởng không khả dụng' }
  }

  return { canRedeem: true }
}

// routes/public/loyalty.ts
import express from 'express'
import jwt from 'jsonwebtoken'
import Customer from '../../models/Customer'
import PointsHistory from '../../models/PointsHistory'
import Reward from '../../models/Reward'
import UserReward from '../../models/UserReward'
import {
  generateVoucherCode,
  deductPoints,
  getTierBenefits,
  getPointsToNextTier,
  canRedeemReward
} from '../../utils/loyaltyUtils'

const router = express.Router()

// Middleware xác thực customer
const authenticateCustomer = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Chưa đăng nhập' })
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const customer = await Customer.findById(decoded.id)

    if (!customer || customer.status !== 'active') {
      return res.status(401).json({ error: 'Tài khoản không hợp lệ' })
    }

    req.customerId = customer._id
    req.customer = customer
    next()
  } catch (err) {
    res.status(401).json({ error: 'Token không hợp lệ' })
  }
}

// GET /public/loyalty/dashboard - Lấy thông tin tổng quan
router.get('/dashboard', authenticateCustomer, async (req: any, res) => {
  try {
    const customer = req.customer

    // Get tier info
    const tierInfo = getPointsToNextTier(
      customer.loyaltyTier,
      customer.totalSpent
    )
    const benefits = getTierBenefits(customer.loyaltyTier)

    // Get recent history
    const recentHistory = await PointsHistory.find({
      customerId: req.customerId
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    res.json({
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        loyaltyPoints: customer.loyaltyPoints,
        loyaltyTier: customer.loyaltyTier,
        totalSpent: customer.totalSpent,
        ordersCount: customer.ordersCount
      },
      tierInfo: {
        current: customer.loyaltyTier,
        nextTier: tierInfo.nextTier,
        spentNeeded: tierInfo.spentNeeded,
        benefits
      },
      recentHistory
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /public/loyalty/history - Lịch sử điểm
router.get('/history', authenticateCustomer, async (req: any, res) => {
  try {
    const { page = '1', limit = '20', type } = req.query

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20
    const skip = (pageNum - 1) * limitNum

    const filter: any = { customerId: req.customerId }
    if (type) {
      filter.type = type
    }

    const [items, total] = await Promise.all([
      PointsHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('orderId', 'orderNumber totalPrice')
        .populate('rewardId', 'name')
        .lean(),
      PointsHistory.countDocuments(filter)
    ])

    res.json({
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /public/loyalty/rewards - Danh sách rewards có thể đổi
router.get('/rewards', authenticateCustomer, async (req: any, res) => {
  try {
    const customer = req.customer

    const rewards = await Reward.find({ isActive: true })
      .sort({ order: 1, pointsRequired: 1 })
      .lean()

    // Check availability for each reward
    const rewardsWithAvailability = rewards.map((reward) => {
      const availability = canRedeemReward(reward, customer)
      return {
        ...reward,
        canRedeem: availability.canRedeem,
        reason: availability.reason
      }
    })

    res.json(rewardsWithAvailability)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /public/loyalty/redeem - Đổi thưởng
router.post('/redeem', authenticateCustomer, async (req: any, res) => {
  try {
    const { rewardId } = req.body
    const customer = req.customer

    if (!rewardId) {
      return res.status(400).json({ error: 'Thiếu rewardId' })
    }

    const reward = await Reward.findById(rewardId)
    if (!reward) {
      return res.status(404).json({ error: 'Không tìm thấy phần thưởng' })
    }

    // Check if can redeem
    const availability = canRedeemReward(reward, customer)
    if (!availability.canRedeem) {
      return res.status(400).json({ error: availability.reason })
    }

    // Generate voucher code
    const prefix = reward.codePrefix || 'REWARD'
    const voucherCode = generateVoucherCode(prefix)

    // Calculate expiry (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Create user reward
    const userReward = await UserReward.create({
      customerId: req.customerId,
      rewardId: reward._id,
      voucherCode,
      expiresAt,
      status: 'active'
    })

    // Deduct points
    await deductPoints(
      req.customerId.toString(),
      reward.pointsRequired,
      'redeem',
      `Đổi thưởng: ${reward.name}`,
      { rewardId: reward._id, rewardName: reward.name }
    )

    // Update reward stock if applicable
    if (reward.stock !== undefined && reward.stock > 0) {
      reward.stock -= 1
      await reward.save()
    }

    res.json({
      message: 'Đổi thưởng thành công',
      voucher: {
        code: voucherCode,
        reward: reward.name,
        expiresAt,
        type: reward.type,
        value: reward.value
      },
      remainingPoints: customer.loyaltyPoints - reward.pointsRequired
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /public/loyalty/vouchers - Danh sách voucher của tôi
router.get('/vouchers', authenticateCustomer, async (req: any, res) => {
  try {
    const { status } = req.query

    const filter: any = { customerId: req.customerId }
    if (status) {
      filter.status = status
    }

    const vouchers = await UserReward.find(filter)
      .populate(
        'rewardId',
        'name description type value minOrderValue maxDiscountAmount'
      )
      .sort({ createdAt: -1 })
      .lean()

    res.json(vouchers)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /public/loyalty/tier-benefits - Thông tin quyền lợi các hạng
router.get('/tier-benefits', async (_req, res) => {
  try {
    const tiers = ['bronze', 'silver', 'gold', 'platinum']
    const benefits = tiers.map((tier) => ({
      tier,
      ...getTierBenefits(tier)
    }))

    res.json(benefits)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router

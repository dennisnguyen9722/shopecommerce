// routes/admin/points.ts
import express from 'express'
import PointsHistory from '../../models/PointsHistory'
import Customer from '../../models/Customer'
import { protect } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/requirePermissions'
import { awardPoints, deductPoints } from '../../utils/loyaltyUtils'

const router = express.Router()

const CAN_MANAGE = requirePermissions('manage_customers')

// GET /admin/points/history - Lịch sử điểm của tất cả khách hàng
router.get('/history', protect, CAN_MANAGE, async (req, res) => {
  try {
    const {
      page = '1',
      limit = '50',
      customerId,
      type,
      startDate,
      endDate
    } = req.query

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 50
    const skip = (pageNum - 1) * limitNum

    const filter: any = {}

    if (customerId) {
      filter.customerId = customerId
    }

    if (type) {
      filter.type = type
    }

    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string)
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate as string)
      }
    }

    const [items, total] = await Promise.all([
      PointsHistory.find(filter)
        .populate('customerId', 'name email loyaltyPoints loyaltyTier')
        .populate('orderId', 'orderNumber totalPrice')
        .populate('rewardId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
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

// POST /admin/points/adjust - Admin điều chỉnh điểm khách hàng
router.post('/adjust', protect, CAN_MANAGE, async (req, res) => {
  try {
    const { customerId, points, reason } = req.body

    if (!customerId || !points || !reason) {
      return res.status(400).json({
        error: 'Thiếu thông tin: customerId, points, reason'
      })
    }

    const customer = await Customer.findById(customerId)
    if (!customer) {
      return res.status(404).json({ error: 'Không tìm thấy khách hàng' })
    }

    // Award or deduct points
    if (points > 0) {
      await awardPoints(
        customerId,
        points,
        'admin_adjust',
        `[Admin] ${reason}`,
        { adminNote: reason }
      )
    } else if (points < 0) {
      await deductPoints(
        customerId,
        Math.abs(points),
        'expire',
        `[Admin] ${reason}`,
        { adminNote: reason }
      )
    }

    // Get updated customer
    const updatedCustomer = await Customer.findById(customerId)

    res.json({
      message: 'Đã điều chỉnh điểm thành công',
      customer: updatedCustomer
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /admin/points/stats - Thống kê điểm
router.get('/stats', protect, CAN_MANAGE, async (_req, res) => {
  try {
    // Total points in system
    const customersWithPoints = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$loyaltyPoints' },
          totalCustomers: { $sum: 1 }
        }
      }
    ])

    // Points by type
    const pointsByType = await PointsHistory.aggregate([
      {
        $group: {
          _id: '$type',
          totalPoints: { $sum: '$points' },
          count: { $sum: 1 }
        }
      }
    ])

    // Recent activities
    const recentActivities = await PointsHistory.find()
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    // Top customers by points
    const topCustomers = await Customer.find()
      .sort({ loyaltyPoints: -1 })
      .limit(10)
      .select('name email loyaltyPoints loyaltyTier totalSpent')
      .lean()

    res.json({
      overview: customersWithPoints[0] || { totalPoints: 0, totalCustomers: 0 },
      pointsByType,
      recentActivities,
      topCustomers
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router

import express from 'express'
import Order from '../models/Order'
import Customer from '../models/Customer'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'

const router = express.Router()
const CAN_VIEW = requirePermissions('view_analytics')

// /admin/metrics
router.get('/', protect, CAN_VIEW, async (req, res) => {
  try {
    const now = new Date()

    // 30 ngày gần đây
    const since30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // 1) Tổng doanh thu 30 ngày
    const revResult = await Order.aggregate([
      { $match: { createdAt: { $gte: since30Days } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ])
    const revenue = revResult[0]?.total || 0

    // 2) Tổng đơn 30 ngày
    const orders = await Order.countDocuments({
      createdAt: { $gte: since30Days }
    })

    // 3) Khách hàng mới 30 ngày
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: since30Days }
    })

    // 4) Tổng đơn toàn hệ thống
    const totalOrders = await Order.countDocuments()

    res.json({
      revenue,
      orders,
      newCustomers,
      totalOrders
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/metrics', protect, CAN_VIEW, async (_req, res) => {
  try {
    const orders = await Order.find()
    const totalOrders = orders.length

    // Unique customers by phone
    const uniquePhones = new Set(orders.map((o) => o.customerPhone))
    const newCustomers = uniquePhones.size

    // Revenue (last 30 days)
    const since = new Date(Date.now() - 30 * 86400000)
    const last30 = orders.filter((o) => o.createdAt >= since)
    const revenue = last30.reduce((sum, o) => sum + (o.totalPrice || 0), 0)

    res.json({
      revenue,
      orders: last30.length,
      totalOrders,
      newCustomers
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router

import express from 'express'
import Order from '../models/Order'
import Customer from '../models/Customer'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'

const router = express.Router()
const CAN_VIEW = requirePermissions('view_analytics')

// GET /admin/metrics - Main metrics endpoint
router.get('/', protect, CAN_VIEW, async (req, res) => {
  console.log('🔥🔥🔥 METRICS ENDPOINT CALLED 🔥🔥🔥')
  try {
    // Disable caching for this endpoint
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private'
    )
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    const since30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // 1) Tổng doanh thu 30 ngày
    const revResult = await Order.aggregate([
      { $match: { createdAt: { $gte: since30Days } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ])
    const revenue = revResult[0]?.total || 0

    // 2) Đơn hàng 30 ngày
    const orders = await Order.countDocuments({
      createdAt: { $gte: since30Days }
    })

    // 3) Khách hàng mới 30 ngày
    // 🔥 DEBUG: Kiểm tra collection name
    console.log(
      '📊 [Debug] Customer collection name:',
      Customer.collection.name
    )
    console.log('📊 [Debug] Database name:', Customer.db.name)

    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: since30Days }
    })

    // 🔥 DEBUG: Log để kiểm tra
    console.log('📊 [Metrics Debug]')
    console.log('Since 30 days:', since30Days)
    console.log('New customers count:', newCustomers)

    // Lấy danh sách customers để xem
    const customersList = await Customer.find({
      createdAt: { $gte: since30Days }
    }).select('name email createdAt')
    console.log('Customers list:', JSON.stringify(customersList, null, 2))

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

export default router

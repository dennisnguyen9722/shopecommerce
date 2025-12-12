import { Router } from 'express'
import Order from '../models/Order'
import User from '../models/User'
import Customer from '../models/Customer' // 👈 THÊM import Customer
import { updateOrderStatus } from '../services/orderService'
import { log } from '../utils/logger'
import { AppError } from '../utils/AppError'
import { protect } from '../middleware/auth'

const router = Router()

// ⭐ BẮT BUỘC LOGIN
router.use(protect)

/* ============================================================
   METRICS - ✅ FIXED: Đếm Customer thay vì User
============================================================ */
router.get('/metrics', async (req, res) => {
  try {
    console.log('🔥🔥🔥 ADMIN /metrics ENDPOINT CALLED 🔥🔥🔥')

    const since = new Date()
    since.setDate(since.getDate() - 30)

    const revenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      }
    ])

    // ✅ FIX: Đếm Customer thay vì User
    const customersNew = await Customer.countDocuments({
      createdAt: { $gte: since }
    })

    console.log('📊 [Debug] New customers:', customersNew)
    console.log('📊 [Debug] Since date:', since)

    const totalOrders = await Order.countDocuments()
    const revenue = revenueAgg[0]?.revenue || 0

    res.json({
      revenue,
      orders: revenueAgg[0]?.orders || 0,
      newCustomers: customersNew,
      totalOrders
    })
  } catch (err) {
    console.error('❌ Error in /admin/metrics:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/* ============================================================
   REVENUE CHART
============================================================ */
router.get('/revenue', async (req, res) => {
  try {
    const since = new Date()
    since.setDate(since.getDate() - 60)

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const now = new Date()
    const recentStart = new Date(now)
    recentStart.setDate(now.getDate() - 30)

    const currentPeriod = data.filter((d) => new Date(d._id) >= recentStart)
    const prevPeriod = data.filter(
      (d) =>
        new Date(d._id) >= new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) &&
        new Date(d._id) < recentStart
    )

    const sum = (arr: any[]) => arr.reduce((a, b) => a + b.totalRevenue, 0)
    const currentTotal = sum(currentPeriod)
    const prevTotal = sum(prevPeriod)
    const percentChange =
      prevTotal === 0 ? 0 : ((currentTotal - prevTotal) / prevTotal) * 100

    res.json({
      series: data,
      currentTotal,
      prevTotal,
      percentChange
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/* ============================================================
   ORDERS STATS
============================================================ */
router.get('/orders-stats', async (req, res) => {
  try {
    const since = new Date()
    since.setDate(since.getDate() - 60)

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.json({ series: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/* ============================================================
   CUSTOMER STATS - ✅ FIXED: Dùng Customer thay vì User
============================================================ */
router.get('/customers-stats', async (req, res) => {
  try {
    const since = new Date()
    since.setDate(since.getDate() - 60)

    // ✅ FIX: Đếm Customer thay vì User
    const data = await Customer.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.json({ series: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/* ============================================================
   LIST ORDERS
============================================================ */
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query
    const filter: any = {}

    if (status && status !== 'all') {
      filter.status = status
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    res.json({ orders })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/* ============================================================
   UPDATE ORDER STATUS
============================================================ */
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const updated = await updateOrderStatus(id, status)
    res.json(updated)
  } catch (err: any) {
    console.error('❌ Lỗi cập nhật đơn hàng:', err.message)
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   ORDER DETAILS
============================================================ */
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params

    const order = (await Order.findById(id).lean()) as any

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
  } catch (err) {
    console.error('❌ [GET /admin/orders/:id] Error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/* ============================================================
   OVERVIEW
============================================================ */
router.get('/overview', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()

    // ✅ FIX: Đếm Customer thay vì User
    const totalCustomers = await Customer.countDocuments()

    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ])

    const last30 = new Date()
    last30.setDate(last30.getDate() - 30)

    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: last30 }
    })

    res.json({
      totalRevenue: revenueAgg[0]?.totalRevenue || 0,
      totalOrders,
      totalCustomers,
      ordersLast30Days: recentOrders
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/* ============================================================
   TEST ERROR
============================================================ */
router.get('/test-error', async (req, res) => {
  log.info('Testing error route')
  throw new AppError('Đây là lỗi giả lập', 400)
})

export default router

import { Router } from 'express'
import Order from '../models/Order'
import User from '../models/User'
import { updateOrderStatus } from '../services/orderService'
import { log } from '../utils/logger'
import { AppError } from '../utils/AppError'
import { protect, adminOnly } from '../middleware/auth'

const router = Router()

router.use(protect, adminOnly)

router.get('/metrics', async (req, res) => {
  try {
    const since = new Date()
    since.setDate(since.getDate() - 30) // 30 ngày gần đây

    const revenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      {
        $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } }
      }
    ])

    const customersNew = await User.countDocuments({
      createdAt: { $gte: since }
    })
    const totalOrders = await Order.countDocuments()
    const revenue = revenueAgg[0]?.revenue || 0

    res.json({
      revenue,
      orders: revenueAgg[0]?.orders || 0,
      newCustomers: customersNew,
      totalOrders
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/revenue', async (req, res) => {
  try {
    const since = new Date()
    since.setDate(since.getDate() - 60) // 60 ngày gần đây (để có dữ liệu so sánh)

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalRevenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Tính tổng 30 ngày gần nhất và kỳ trước
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

router.get('/customers-stats', async (req, res) => {
  try {
    const since = new Date()
    since.setDate(since.getDate() - 60)

    const data = await User.aggregate([
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

router.get('/notifications', async (req, res) => {
  try {
    // Mô phỏng dữ liệu tạm (sau này bạn có thể lấy từ DB)
    const notifications = [
      {
        id: 1,
        type: 'order',
        message: 'Đơn hàng #1025 - 2.350.000₫',
        time: '5 phút trước'
      },
      {
        id: 2,
        type: 'stock',
        message: 'Sản phẩm "Áo thun trắng" sắp hết hàng (3 tồn)',
        time: '10 phút trước'
      },
      {
        id: 3,
        type: 'review',
        message: 'Đánh giá mới từ Huy Nguyễn: “Rất tốt!”',
        time: '15 phút trước'
      }
    ]

    res.json({ notifications })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query
    const filter: any = {}
    if (status && status !== 'all') {
      filter.status = status
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    // Giả lập thông tin khách hàng
    const users = await User.find().lean()
    const getUser = (id: any) =>
      users[Math.floor(Math.random() * users.length)] || {
        name: 'Khách hàng ẩn danh'
      }

    const data = orders.map((order) => ({
      ...order,
      customer: getUser(order.userId)
    }))

    res.json({ orders: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

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

router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params

    const order = await Order.findById(id).lean()
    if (!order) return res.status(404).json({ error: 'Order not found' })

    // Mock data sản phẩm (sau này có thể join từ Product)
    const mockItems = [
      { name: 'Áo thun trắng', quantity: 2, price: 250000 },
      { name: 'Quần kaki', quantity: 1, price: 700000 }
    ]

    const customer = await User.findOne().lean()

    res.json({
      ...order,
      items: mockItems,
      customer: customer || {
        name: 'Khách hàng ẩn danh',
        email: 'unknown@example.com',
        address: 'Chưa cập nhật'
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/overview', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()
    const totalCustomers = await User.countDocuments()

    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
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

router.get('/test-error', async (req, res) => {
  log.info('Testing error route')
  throw new AppError('Đây là lỗi giả lập', 400)
})

export default router

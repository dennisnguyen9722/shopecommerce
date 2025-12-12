import express from 'express'
import Order from '../models/Order'
import Customer from '../models/Customer'
import Product from '../models/Product'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'
import { PipelineStage } from 'mongoose'

const router = express.Router()

const CAN_VIEW = requirePermissions('view_analytics')

/* ============================================================
   A1. Revenue summary
============================================================ */
router.get('/revenue-summary', protect, CAN_VIEW, async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )

    const [total, month, today] = await Promise.all([
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ])

    res.json({
      total: total[0]?.total || 0,
      month: month[0]?.total || 0,
      today: today[0]?.total || 0
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   A2. Revenue chart
============================================================ */
router.get('/revenue-chart', protect, CAN_VIEW, async (req, res) => {
  try {
    const days = Number(req.query.days || 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.json(data.map((d) => ({ date: d._id, total: d.total })))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   A3. Best-selling products - FIXED VERSION
============================================================ */
router.get('/best-products', protect, CAN_VIEW, async (req, res) => {
  try {
    const limitNum = Number(req.query.limit || 5)
    const days = Number(req.query.days || 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const items = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
          status: { $ne: 'cancelled' } // Loại bỏ đơn đã hủy
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          // Group by product + variant (nếu có)
          _id: {
            product: '$items.product',
            variantId: '$items.variantId'
          },
          productId: { $first: '$items.product' },
          variantId: { $first: '$items.variantId' },
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          sku: {
            $first: { $ifNull: ['$items.sku', '$items.variantInfo.sku'] }
          },
          variantInfo: { $first: '$items.variantInfo' },
          quantitySold: { $sum: '$items.quantity' }, // 🔥 FIX: Đổi từ totalSold
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { quantitySold: -1 } }, // Sort by quantity sold
      { $limit: limitNum },
      {
        $project: {
          _id: 0, // Loại bỏ _id phức tạp
          productId: 1,
          variantId: 1,
          name: 1,
          image: 1,
          sku: 1,
          variantInfo: 1,
          quantitySold: 1,
          revenue: 1
        }
      }
    ])

    res.json(items)
  } catch (err: any) {
    console.error('❌ [Best Products] Error:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   A4. Top customers
============================================================ */
// GET /admin/analytics/top-customers
router.get('/top-customers', async (req, res) => {
  try {
    const topCustomers = await Customer.find({ status: 'active' })
      .sort({ ordersCount: -1 })
      .limit(10)
      .select('name email ordersCount totalSpent loyaltyTier loyaltyPoints')
      .lean()

    res.json(topCustomers)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   A5. Purchase frequency
============================================================ */
router.get('/purchase-frequency', protect, CAN_VIEW, async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: '$customerPhone',
          customerName: { $first: '$customerName' },
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { ordersCount: -1 } }
    ])

    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   A6. Inventory overview
============================================================ */
router.get('/inventory-overview', protect, CAN_VIEW, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments()
    const outOfStock = await Product.countDocuments({ stock: 0 })
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lt: 5 } })

    res.json({
      totalProducts,
      outOfStock,
      lowStock,
      totalVariants: 0
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// A7. New customers (unique phone numbers in last 30 days)
// GET /admin/analytics/new-customers
// ============================================================
router.get('/new-customers', protect, CAN_VIEW, async (_req, res) => {
  try {
    const days = 30
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const pipeline: PipelineStage[] = [
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$customerPhone'
        }
      }
    ]

    const results = await Order.aggregate(pipeline)

    res.json({
      newCustomers: results.length
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Thêm vào cuối file src/routes/analytics.ts

/* ============================================================
   A8. Order Status Distribution (for Pie Chart)
============================================================ */
router.get(
  '/order-status-distribution',
  protect,
  CAN_VIEW,
  async (req, res) => {
    try {
      const days = Number(req.query.days || 30)
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const distribution = await Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])

      // Format để dễ sử dụng với chart
      const statusLabels: Record<string, string> = {
        pending: 'Chờ xử lý',
        processing: 'Đang xử lý',
        shipped: 'Đang giao',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
      }

      const formatted = distribution.map((item) => ({
        status: item._id,
        count: item.count,
        label: statusLabels[item._id] || item._id
      }))

      res.json(formatted)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  }
)

/* ============================================================
   A9. Recent Orders (for Real-time widget)
============================================================ */
router.get('/recent-orders', protect, CAN_VIEW, async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10)

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        'orderNumber customerName customerPhone totalPrice status createdAt'
      )
      .lean()

    res.json(orders)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   A10. Average Order Value (AOV)
============================================================ */
router.get('/average-order-value', protect, CAN_VIEW, async (req, res) => {
  try {
    const days = Number(req.query.days || 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Current period
    const currentAOV = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          avgOrderValue: { $avg: '$totalPrice' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ])

    // Previous period (for comparison)
    const previousSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000)
    const previousAOV = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousSince, $lt: since },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          avgOrderValue: { $avg: '$totalPrice' }
        }
      }
    ])

    const current = currentAOV[0] || {
      avgOrderValue: 0,
      totalOrders: 0,
      totalRevenue: 0
    }
    const previous = previousAOV[0]?.avgOrderValue || 0

    const growth =
      previous > 0 ? ((current.avgOrderValue - previous) / previous) * 100 : 0

    res.json({
      current: Math.round(current.avgOrderValue),
      previous: Math.round(previous),
      growth: Math.round(growth * 10) / 10, // 1 số thập phân
      totalOrders: current.totalOrders,
      totalRevenue: current.totalRevenue
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   A11. Sales by Category (for Bar Chart)
============================================================ */
router.get('/sales-by-category', protect, CAN_VIEW, async (req, res) => {
  try {
    const days = Number(req.query.days || 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryInfo._id',
          categoryName: { $first: '$categoryInfo.name' },
          totalRevenue: {
            $sum: { $multiply: ['$items.quantity', '$items.price'] }
          },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ])

    res.json(
      sales.map((item) => ({
        category: item.categoryName || 'Chưa phân loại',
        revenue: item.totalRevenue,
        quantity: item.totalQuantity
      }))
    )
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   A12. Dashboard Overview (All stats in one call)
============================================================ */
router.get('/dashboard-overview', protect, CAN_VIEW, async (req, res) => {
  try {
    const days = Number(req.query.days || 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const previousSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000)

    const [
      currentStats,
      previousStats,
      totalProducts,
      totalCustomers,
      lowStockCount
    ] = await Promise.all([
      // Current period stats
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: since },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalPrice' }
          }
        }
      ]),

      // Previous period stats
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: previousSince, $lt: since },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalPrice' }
          }
        }
      ]),

      Product.countDocuments(),
      Customer.countDocuments(),
      Product.countDocuments({ stock: { $gt: 0, $lt: 5 } })
    ])

    const current = currentStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0
    }
    const previous = previousStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0
    }

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return 0
      return ((current - previous) / previous) * 100
    }

    res.json({
      revenue: {
        value: current.totalRevenue,
        growth: calculateGrowth(current.totalRevenue, previous.totalRevenue),
        previous: previous.totalRevenue
      },
      orders: {
        value: current.totalOrders,
        growth: calculateGrowth(current.totalOrders, previous.totalOrders),
        previous: previous.totalOrders
      },
      avgOrderValue: {
        value: Math.round(current.avgOrderValue),
        growth: calculateGrowth(current.avgOrderValue, previous.avgOrderValue),
        previous: Math.round(previous.avgOrderValue)
      },
      products: {
        total: totalProducts,
        lowStock: lowStockCount
      },
      customers: {
        total: totalCustomers
      }
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router

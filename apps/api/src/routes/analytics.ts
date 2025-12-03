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
   A3. Best-selling products
============================================================ */
router.get('/best-products', protect, CAN_VIEW, async (req, res) => {
  try {
    const limitNum = Number(req.query.limit || 5)
    const days = Number(req.query.days || 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const items = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limitNum }
    ])

    res.json(items)
  } catch (err: any) {
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

export default router

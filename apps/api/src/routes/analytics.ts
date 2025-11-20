import express from 'express'
import Order from '../models/Order'
import Customer from '../models/Customer'
import Product from '../models/Product'
import { protect, adminOnly } from '../middleware/auth'
import { PipelineStage } from 'mongoose'

const router = express.Router()

router.use(protect, adminOnly)

/* ============================================================
   A1. Revenue summary (today / month / total)
   GET /admin/analytics/revenue-summary
============================================================ */
router.get('/revenue-summary', async (_req, res) => {
  try {
    const now = new Date()

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )

    const [total, month, today] = await Promise.all([
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
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
   A2. Revenue chart (daily revenue)
   GET /admin/analytics/revenue-chart?days=30
============================================================ */
router.get('/revenue-chart', async (req, res) => {
  try {
    const days = Number(req.query.days || 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const pipeline: PipelineStage[] = [
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]

    const results = await Order.aggregate(pipeline)

    res.json(results.map((r) => ({ date: r._id, total: r.total })))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   A3. Best-selling products
   GET /admin/analytics/best-products?limit=5&days=30
============================================================ */
router.get('/best-products', async (req, res) => {
  try {
    const limitNum = Number(req.query.limit || 5)
    const days = Number(req.query.days || 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const pipeline: PipelineStage[] = [
      { $match: { createdAt: { $gte: since } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: limitNum },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$product._id',
          name: '$product.name',
          sku: '$product.sku',
          image: { $arrayElemAt: ['$product.images', 0] },
          quantitySold: 1,
          revenue: 1
        }
      }
    ]

    const items = await Order.aggregate(pipeline)
    res.json(items)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   A4. Customer Lifetime Value (Top customers)
   GET /admin/analytics/top-customers?limit=5
============================================================ */
router.get('/top-customers', async (req, res) => {
  try {
    const limitNum = Number(req.query.limit || 5)

    const customers = await Customer.find()
      .sort({ totalSpent: -1 })
      .limit(limitNum)
      .lean()

    res.json(customers)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   A5. Customer Purchase Frequency (order count grouped)
   GET /admin/analytics/purchase-frequency
============================================================ */
router.get('/purchase-frequency', async (_req, res) => {
  try {
    const pipeline: PipelineStage[] = [
      {
        $group: {
          _id: '$customer',
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { ordersCount: -1 } }
    ]

    const result = await Order.aggregate(pipeline)
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   A6. Inventory Overview
   GET /admin/analytics/inventory-overview
   → Tổng số sản phẩm, số biến thể, low-stock (<5), hết hàng (=0)
============================================================ */

router.get('/inventory-overview', async (_req, res) => {
  try {
    const totalProducts = await Product.countDocuments()
    const outOfStock = await Product.countDocuments({ stock: 0 })
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lt: 5 } })

    // Nếu bạn có biến thể (variants), tùy model mà tính:
    const totalVariants = 0 // hoặc Product.aggregate([...])

    res.json({
      totalProducts,
      lowStock,
      outOfStock,
      totalVariants
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router

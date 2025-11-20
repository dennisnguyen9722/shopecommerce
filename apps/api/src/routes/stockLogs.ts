import express from 'express'
import { protect, adminOnly } from '../middleware/auth'
import StockLog from '../models/StockLog'
import Product from '../models/Product'

const router = express.Router()

router.use(protect, adminOnly)

// GET /admin/stock-logs
// ?page=1&limit=20&type=adjust|import|return|bulk|manual&product=productId&q=search&from=2024-01-01&to=2024-02-01
router.get('/', async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    product,
    q,
    from,
    to
  } = req.query as Record<string, string>

  const pageNum = Number(page) || 1
  const pageSize = Number(limit) || 20

  const query: any = {}

  if (type && type !== 'all') {
    query.type = type
  }

  if (product) {
    query.product = product
  }

  if (from || to) {
    query.createdAt = {}
    if (from) {
      query.createdAt.$gte = new Date(from)
    }
    if (to) {
      const end = new Date(to)
      end.setHours(23, 59, 59, 999)
      query.createdAt.$lte = end
    }
  }

  // Nếu có q: search theo note hoặc product name/slug
  let productIds: string[] | undefined
  if (q && q.trim() !== '') {
    const regex = new RegExp(q.trim(), 'i')
    const matchedProducts = await Product.find({
      $or: [{ name: regex }, { slug: regex }]
    }).select('_id')
    productIds = matchedProducts.map((p) => p._id.toString())
    query.$or = [{ note: regex }, { product: { $in: productIds } }]
  }

  const [items, total] = await Promise.all([
    StockLog.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate('product', 'name slug')
      .populate('admin', 'name email'),
    StockLog.countDocuments(query)
  ])

  res.json({
    items,
    page: pageNum,
    pages: Math.ceil(total / pageSize),
    total
  })
})

export default router

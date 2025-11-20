// apps/api/src/routes/products.ts
import express from 'express'
import multer from 'multer'
import Product from '../models/Product'
import { uploadStream } from '../utils/cloudinary'
import { protect, adminOnly } from '../middleware/auth'
import StockLog from '../models/StockLog'

const router = express.Router()

// Upload memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

router.use(protect, adminOnly)

// =============================
// UPLOAD IMAGE
// =============================
router.post('/upload', upload.array('images'), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const results = await Promise.all(files.map((f) => uploadStream(f.buffer)))

    res.json({ images: results })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// =============================
// CREATE PRODUCT
// =============================
router.post('/', async (req, res) => {
  try {
    const body = req.body

    if (!body.name || !body.price) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const price = Number(body.price)
    const comparePrice = Number(body.comparePrice ?? 0)

    if (comparePrice > 0 && comparePrice <= price) {
      return res.status(400).json({
        error: 'Giá gốc phải lớn hơn giá bán'
      })
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')

    const product = await Product.create({
      ...body,
      price,
      comparePrice,
      slug
    })

    res.status(201).json(product)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// =============================
// LIST PRODUCT (with discount info)
// =============================
router.get('/', async (req, res) => {
  try {
    const items = await Product.find()
      .populate('category', 'name') // ⭐ add category
      .sort({ createdAt: -1 })
      .lean()

    const formatted = items.map((p) => {
      const price = p.price
      const comparePrice = p.comparePrice ?? 0

      const hasDiscount = comparePrice > price
      const discountPercent = hasDiscount
        ? Math.round(((comparePrice - price) / comparePrice) * 100)
        : 0

      return {
        ...p,
        hasDiscount,
        discountPercent
      }
    })

    res.json({ items: formatted })
  } catch (err: any) {
    res.status(500).json({ error: 'Internal error' })
  }
})

// =============================
// DETAIL
// =============================
router.get('/:id', async (req, res) => {
  try {
    const item = await Product.findById(req.params.id).lean()
    if (!item) return res.status(404).json({ error: 'Not found' })

    res.json(item)
  } catch (err: any) {
    res.status(500).json({ error: 'Internal error' })
  }
})

// =============================
// UPDATE PRODUCT
// =============================
router.put('/:id', async (req, res) => {
  try {
    const update: any = { ...req.body }

    if (update.price != null) update.price = Number(update.price)
    if (update.comparePrice != null)
      update.comparePrice = Number(update.comparePrice)

    if (update.comparePrice && update.comparePrice <= update.price) {
      return res.status(400).json({
        error: 'Giá gốc phải lớn hơn giá bán'
      })
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true
    }).lean()

    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// =============================
// DELETE PRODUCT
// =============================
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/bulk-delete', async (req, res) => {
  const { ids } = req.body

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Danh sách IDs không hợp lệ' })
  }

  await Product.deleteMany({ _id: { $in: ids } })

  res.json({ ok: true })
})

// ----------------------------------------
// ADJUST STOCK MANUALLY (ADMIN)
// POST /admin/products/:id/adjust-stock
// ----------------------------------------
router.post('/:id/adjust-stock', async (req, res) => {
  try {
    const { change, note } = req.body

    const diff = Number(change)
    if (!diff || Number.isNaN(diff)) {
      return res.status(400).json({ error: 'Giá trị change không hợp lệ' })
    }

    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })
    }

    const oldStock = product.stock || 0
    const newStock = oldStock + diff

    product.stock = newStock
    await product.save()

    await StockLog.create({
      product: product._id,
      change: diff,
      oldStock,
      newStock,
      type: 'adjust',
      note,
      admin: (req as any).user?._id
    })

    res.json({ ok: true, stock: newStock })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ----------------------------------------
// GET STOCK LOG OF A PRODUCT
// GET /admin/products/:id/stock-logs
// ----------------------------------------
router.get('/:id/stock-logs', async (req, res) => {
  try {
    const logs = await StockLog.find({ product: req.params.id })
      .sort({ createdAt: -1 })
      .limit(100)

    res.json({ items: logs })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router

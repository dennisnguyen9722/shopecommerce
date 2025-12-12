import express from 'express'
import multer from 'multer'
import Product from '../models/Product'
import { uploadStream } from '../utils/cloudinary'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'
import StockLog from '../models/StockLog'

const router = express.Router()

// Upload config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

const CAN_MANAGE = requirePermissions('manage_products')

/* ------------------------------------------
   UPLOAD IMAGES
---------------------------------------------*/
router.post(
  '/upload',
  protect,
  CAN_MANAGE,
  upload.array('images'),
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[]

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' })
      }

      const results = await Promise.all(
        files.map((f) => uploadStream(f.buffer))
      )

      res.json({ images: results })
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  }
)

/* ------------------------------------------
   CREATE PRODUCT - ✅ UPDATED with brand
---------------------------------------------*/
router.post('/', protect, CAN_MANAGE, async (req, res) => {
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
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')

    // ✅ NEW: Handle brand field
    const productData: any = {
      ...body,
      price,
      comparePrice,
      slug
    }

    // Convert empty string or 'null' to null for brand
    if (!productData.brand || productData.brand === 'null') {
      productData.brand = null
    }

    const product = await Product.create(productData)

    // Populate brand before returning
    await product.populate('brand', 'name slug logo')

    res.status(201).json(product)
  } catch (err: any) {
    console.error('❌ Error creating product:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ------------------------------------------
   LIST PRODUCTS — ADMIN - ✅ UPDATED with brand filter
---------------------------------------------*/
router.get('/', protect, CAN_MANAGE, async (req, res) => {
  try {
    const {
      search = '',
      category = 'all',
      brand = 'all', // ✅ NEW: brand filter
      stock = 'all',
      sort = 'newest',
      page = 1,
      limit = 10
    } = req.query

    const query: any = {}

    if (search) {
      query.name = { $regex: search as string, $options: 'i' }
    }

    if (category !== 'all') {
      query.category = category
    }

    // ✅ NEW: Brand filter
    if (brand !== 'all') {
      if (brand === 'none') {
        // Filter products without brand
        query.brand = null
      } else {
        query.brand = brand
      }
    }

    if (stock === 'in') query.stock = { $gt: 0 }
    if (stock === 'out') query.stock = { $lte: 0 }

    const skip = (Number(page) - 1) * Number(limit)

    const items = await Product.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo') // ✅ NEW: populate brand
      .sort({ createdAt: sort === 'oldest' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean({ virtuals: true })

    const total = await Product.countDocuments(query)

    res.json({
      items,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    })
  } catch (err: any) {
    console.error('❌ Error listing products:', err)
    res.status(500).json({ error: 'Internal error' })
  }
})

/* ------------------------------------------
   DETAIL - ✅ UPDATED with brand
---------------------------------------------*/
router.get('/:id', protect, CAN_MANAGE, async (req, res) => {
  try {
    const item = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo') // ✅ NEW: populate brand
      .lean({ virtuals: true })

    if (!item) return res.status(404).json({ error: 'Not found' })

    res.json(item)
  } catch (err: any) {
    console.error('❌ Error fetching product:', err)
    res.status(500).json({ error: 'Internal error' })
  }
})

/* ------------------------------------------
   UPDATE PRODUCT - ✅ UPDATED with brand
---------------------------------------------*/
router.put('/:id', protect, CAN_MANAGE, async (req, res) => {
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

    // ✅ NEW: Handle brand field
    if (!update.brand || update.brand === 'null') {
      update.brand = null
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true
    })
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo') // ✅ NEW: populate brand
      .lean({ virtuals: true })

    res.json(updated)
  } catch (err: any) {
    console.error('❌ Error updating product:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ------------------------------------------
   ⭐⭐⭐ TOGGLE PUBLISH (Công khai / Ẩn)
---------------------------------------------*/
router.patch('/:id/publish', protect, CAN_MANAGE, async (req, res) => {
  try {
    const { isPublished } = req.body

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { isPublished: !!isPublished },
      { new: true }
    )
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .lean({ virtuals: true })

    if (!updated) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ------------------------------------------
   UPDATE FEATURED
---------------------------------------------*/
router.patch('/:id/featured', protect, CAN_MANAGE, async (req, res) => {
  try {
    const { isFeatured } = req.body

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { isFeatured },
      { new: true }
    )
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .lean({ virtuals: true })

    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })
    }

    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ------------------------------------------
   DELETE PRODUCT
---------------------------------------------*/
router.delete('/:id', protect, CAN_MANAGE, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ------------------------------------------
   BULK DELETE
---------------------------------------------*/
router.post('/bulk-delete', protect, CAN_MANAGE, async (req, res) => {
  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Danh sách IDs không hợp lệ' })
    }

    await Product.deleteMany({ _id: { $in: ids } })

    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ------------------------------------------
   ADJUST STOCK
---------------------------------------------*/
router.post('/:id/adjust-stock', protect, CAN_MANAGE, async (req, res) => {
  try {
    const { change, note } = req.body

    const diff = Number(change)
    if (!diff || Number.isNaN(diff)) {
      return res.status(400).json({ error: 'Giá trị change không hợp lệ' })
    }

    const product = await Product.findById(req.params.id)
    if (!product)
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })

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
      admin: (req as any).user?.id
    })

    res.json({ ok: true, stock: newStock })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ------------------------------------------
   GET STOCK LOGS
---------------------------------------------*/
router.get('/:id/stock-logs', protect, CAN_MANAGE, async (req, res) => {
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

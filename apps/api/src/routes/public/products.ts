import express, { Request, Response } from 'express'
import Product from '../../models/Product'

const router = express.Router()

// ======================================================
// ⭐ COMMON SELECT FIELDS
// ======================================================
const PRODUCT_FIELDS = `
  _id
  name
  slug
  description
  price
  comparePrice
  discountPercent
  hasDiscount
  createdAt
  images
  category
  specs
  hasVariants
  variantGroups
  variants
  isNew
  isHot
  isFeatured
  isPublished
  stock
`

// ======================================================
// ⭐ HELPERS
// ======================================================
const applyFilters = (req: Request) => {
  const filter: any = {
    $or: [{ isPublished: true }, { isPublished: { $exists: false } }]
  }

  // lọc theo category
  if (req.query.category) {
    filter.category = req.query.category
  }

  // lọc theo khoảng giá
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {}
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice)
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice)
  }

  return filter
}

const applySort = (sortQuery?: string): Record<string, 1 | -1> => {
  switch (sortQuery) {
    case 'price-asc':
      return { price: 1 }
    case 'price-desc':
      return { price: -1 }
    case 'oldest':
      return { createdAt: 1 }
    default:
      // newest
      return { createdAt: -1 }
  }
}

// ======================================================
// ⭐ NEW PRODUCTS — phải đặt TRÊN slug
// ======================================================
router.get('/new', async (_req, res) => {
  try {
    const products = await Product.find({ isPublished: true })
      .populate('category', 'name slug _id') // ⭐ FIX _id
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    res.json(products)
  } catch (err) {
    console.error('❌ [GET /public/products/new] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================================================
// 🔍 SEARCH REALTIME
// ======================================================
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = String(req.query.query || '').trim()

    if (!query) return res.json([])

    const products = await Product.find({
      name: { $regex: query, $options: 'i' },
      $or: [{ isPublished: true }, { isPublished: { $exists: false } }]
    })
      .populate('category', 'name slug _id')
      .limit(10)
      .select('_id name slug images price comparePrice')
      .lean()

    res.json(products)
  } catch (err) {
    console.error('❌ [GET /public/products/search] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================================================
// 💸 DISCOUNT PRODUCTS — TRƯỚC slug
// ======================================================
router.get('/discount', async (_req, res) => {
  try {
    const products = await Product.find({
      comparePrice: { $gt: 0 },
      $or: [{ isPublished: true }, { isPublished: { $exists: false } }]
    })
      .populate('category', 'name slug _id') // ⭐ FIX _id
      .sort({ discountPercent: -1 })
      .limit(10)
      .lean()

    res.json(products)
  } catch (err) {
    console.error('❌ [GET /public/products/discount] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================================================
// ⭐ FEATURED PRODUCTS
// ======================================================
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      $or: [{ isPublished: true }, { isPublished: { $exists: false } }]
    })
      .populate('category', 'name slug _id') // ⭐ FIX _id
      .sort({ createdAt: -1 })
      .limit(8)
      .select(PRODUCT_FIELDS)
      .lean()

    res.json(products)
  } catch (err) {
    console.error('❌ [GET /public/products/featured] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================================================
// ⚡ GET ALL PRODUCTS (GRID)
// ======================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const filter = applyFilters(req)
    const sortObj = applySort(String(req.query.sort || ''))
    const limit = Number(req.query.limit) || 50

    const products = await Product.find(filter)
      .populate('category', 'name slug _id') // ⭐ FIX _id HERE
      .sort(sortObj)
      .limit(limit)
      .select(PRODUCT_FIELDS)
      .lean()

    res.json(products)
  } catch (err) {
    console.error('❌ [GET /public/products] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================================================
// 🔍 GET PRODUCT DETAIL — luôn đặt cuối
// ======================================================
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      $or: [{ isPublished: true }, { isPublished: { $exists: false } }]
    })
      .populate('category', 'name slug _id') // ⭐ FIX _id HERE
      .select(PRODUCT_FIELDS)
      .lean()

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(product)
  } catch (err) {
    console.error('❌ [GET /public/products/:slug] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

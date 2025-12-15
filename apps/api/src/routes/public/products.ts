import express, { Request, Response } from 'express'
import mongoose from 'mongoose' // 👈 Import mongoose để check ID/Slug
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
  brand
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

  // 1. Lọc theo category
  if (req.query.category) {
    filter.category = req.query.category
  }

  // 2. Lọc theo brand (ID đã được xử lý ở route handler)
  if (req.query.brand) {
    filter.brand = req.query.brand
  }

  // 3. Lọc theo khoảng giá
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
// ROUTES
// ======================================================

// 1. NEW PRODUCTS
router.get('/new', async (_req, res) => {
  try {
    const products = await Product.find({ isPublished: true })
      .populate('category', 'name slug _id')
      .populate('brand', 'name slug logo')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    res.json(products)
  } catch (err) {
    console.error('❌ [GET /public/products/new] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// 2. SEARCH REALTIME
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = String(req.query.query || '').trim()

    if (!query) return res.json([])

    const products = await Product.find({
      name: { $regex: query, $options: 'i' },
      $or: [{ isPublished: true }, { isPublished: { $exists: false } }]
    })
      .populate('category', 'name slug _id')
      .populate('brand', 'name slug logo')
      .limit(10)
      .select('_id name slug images price comparePrice brand')
      .lean()

    res.json(products)
  } catch (err) {
    console.error('❌ [GET /public/products/search] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// 3. DISCOUNT PRODUCTS
router.get('/discount', async (_req, res) => {
  try {
    const products = await Product.find({
      comparePrice: { $gt: 0 },
      $or: [{ isPublished: true }, { isPublished: { $exists: false } }]
    })
      .populate('category', 'name slug _id')
      .populate('brand', 'name slug logo')
      .sort({ discountPercent: -1 })
      .limit(10)
      .lean()

    res.json(products)
  } catch (err) {
    console.error('❌ [GET /public/products/discount] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// 4. FEATURED PRODUCTS
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      $or: [{ isPublished: true }, { isPublished: { $exists: false } }]
    })
      .populate('category', 'name slug _id')
      .populate('brand', 'name slug logo')
      .sort({ createdAt: -1 })
      .limit(10)
      .select(PRODUCT_FIELDS)
      .lean()

    res.json(products)
  } catch (err) {
    console.error('❌ [GET /public/products/featured] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// 5. ⚡ GET ALL PRODUCTS (GRID) - ĐÃ FIX LOGIC BRAND SLUG
router.get('/', async (req: Request, res: Response) => {
  try {
    // 👇 FIX: Xử lý Brand Slug trước khi tạo filter
    if (req.query.brand) {
      const brandInput = String(req.query.brand)

      // Nếu input KHÔNG phải là ObjectId (tức là Slug) -> Tìm ID
      if (!mongoose.Types.ObjectId.isValid(brandInput)) {
        const BrandModel = mongoose.models.Brand || mongoose.model('Brand')
        const brandDoc = await BrandModel.findOne({ slug: brandInput }).select(
          '_id'
        )

        if (brandDoc) {
          // Thay thế slug bằng _id thật để filter hoạt động
          req.query.brand = brandDoc._id.toString()
        } else {
          // Nếu không tìm thấy brand -> Trả về rỗng luôn
          return res.json([])
        }
      }
    }
    // 👆 END FIX

    const filter = applyFilters(req)
    const sortObj = applySort(String(req.query.sort || ''))
    const limit = Number(req.query.limit) || 50

    const products = await Product.find(filter)
      .populate('category', 'name slug _id')
      .populate('brand', 'name slug logo')
      .sort(sortObj)
      .limit(limit)
      .select(PRODUCT_FIELDS)
      .lean()

    res.json(products)
  } catch (err: any) {
    console.error('❌ [GET /public/products] ERROR:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================================================
// 7. GET RELATED PRODUCTS (RECOMMENDATION)
// ======================================================
router.get('/related', async (req: Request, res: Response) => {
  try {
    const { currentProductId, categoryId } = req.query
    const limit = Number(req.query.limit) || 4

    // Validate input cơ bản
    if (!currentProductId || !categoryId) {
      return res
        .status(400)
        .json({ error: 'Missing currentProductId or categoryId' })
    }

    // Logic Content-based:
    // 1. Cùng Category
    // 2. Không phải sản phẩm hiện tại ($ne: Not Equal)
    // 3. Chỉ lấy sản phẩm Đang Published
    const query = {
      category: categoryId,
      _id: { $ne: currentProductId },
      $or: [{ isPublished: true }, { isPublished: { $exists: false } }]
    }

    const products = await Product.find(query)
      .populate('category', 'name slug _id')
      .populate('brand', 'name slug logo')
      // Sắp xếp thông minh hơn một chút:
      // Ưu tiên sản phẩm nổi bật (isFeatured) -> Bán chạy (sold) -> Mới nhất (createdAt)
      .sort({ isFeatured: -1, sold: -1, createdAt: -1 })
      .limit(limit)
      .select(PRODUCT_FIELDS) // Dùng lại hằng số field bạn đã định nghĩa
      .lean()

    res.json(products)
  } catch (err) {
    console.error('❌ [GET /public/products/related] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// 6. GET PRODUCT DETAIL
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      $or: [{ isPublished: true }, { isPublished: { $exists: false } }]
    })
      .populate('category', 'name slug _id')
      .populate('brand', 'name slug logo') // Lấy cả thông tin brand
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

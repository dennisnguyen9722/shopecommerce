import express, { Request, Response } from 'express'
import Product from '../../models/Product'

const router = express.Router()

// ==============================
// ⚡ GET ALL PRODUCTS (GRID)
// ==============================
router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({
      $or: [
        { isPublished: true },
        { isPublished: { $exists: false } } // hỗ trợ sản phẩm cũ
      ]
    })
      .sort({ createdAt: -1 })
      .select(
        `
        _id 
        name 
        price 
        comparePrice 
        discountPercent 
        hasDiscount 
        createdAt 
        slug 
        images 
        category 
        isNew 
        isHot
        isFeatured
      `
      )

    res.json(products)
  } catch (err) {
    console.error('❌ [GET /public/products] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ==============================
// ⭐ GET FEATURED PRODUCTS
// ==============================
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({
      isFeatured: true, // ⭐ FIXED!!
      $or: [{ isPublished: true }, { isPublished: { $exists: false } }]
    })
      .limit(8)
      .sort({ createdAt: -1 })
      .select(
        `
        _id 
        name 
        price 
        comparePrice 
        discountPercent 
        hasDiscount 
        createdAt 
        slug 
        images
        isNew 
        isHot
        isFeatured
      `
      )

    res.json(products)
  } catch (err) {
    console.error('❌ [GET /public/products/featured] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ==============================
// 🔍 GET PRODUCT DETAIL
// ==============================
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      $or: [{ isPublished: true }, { isPublished: { $exists: false } }]
    }).select(
      `
      _id 
      name 
      description 
      price 
      comparePrice 
      discountPercent 
      hasDiscount 
      createdAt 
      slug 
      images 
      category 
      variants 
      isNew 
      isHot
      isFeatured
    `
    )

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

import express from 'express'
import Product from '../models/Product'
import { protect, adminOnly } from '../middleware/auth'

const router = express.Router()

router.use(protect, adminOnly)

/**
 * GET /admin/inventory/list
 * Lấy danh sách sản phẩm + tồn kho
 */
router.get('/list', async (_req, res) => {
  try {
    const items = await Product.find()
      .select('_id name slug stock category images')
      .populate('category', 'name')
      .lean()

    res.json({ items })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router

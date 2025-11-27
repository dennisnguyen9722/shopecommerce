import express from 'express'
import Product from '../models/Product'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'

const router = express.Router()

// ⭐ Inventory cần quyền xem sản phẩm
const CAN_READ_INVENTORY = requirePermissions('products.read')

router.use(protect, CAN_READ_INVENTORY)

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

import express, { Request, Response } from 'express'
import Category from '../../models/Category'

const router = express.Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find()
      .sort({ position: 1 }) // nếu bạn có field position
      .select('_id name slug icon') // ⭐ FIX: lấy đúng icon

    res.json(categories)
  } catch (err) {
    console.error('❌ [GET /public/categories] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params

    const category = await Category.findOne({ slug }).select(
      '_id name slug icon'
    )

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json(category)
  } catch (err) {
    console.error('❌ [GET /public/categories/slug/:slug] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

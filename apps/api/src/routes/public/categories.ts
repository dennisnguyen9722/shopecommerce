import express, { Request, Response } from 'express'
import Category from '../../models/Category'

const router = express.Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find()
      .sort({ position: 1 })
      .select('_id name slug imageUrl')

    res.json(categories)
  } catch (err) {
    console.error('❌ [GET /public/categories] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

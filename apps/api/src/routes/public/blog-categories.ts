import express from 'express'
import BlogCategory from '../../models/BlogCategory' // Nhớ import đúng model BlogCategory

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const categories = await BlogCategory.find()
      .select('name slug')
      .sort({ createdAt: -1 })
      .lean()

    res.json(categories)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

import express from 'express'
import BlogCategory from '../../models/BlogCategory'
import { protect } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/requirePermissions'

const router = express.Router()

// ⭐ Quyền quản lý danh mục bài viết
const CAN_MANAGE_BLOG_CATEGORIES = requirePermissions('manage_blog_categories')

// Tất cả routes trong file đều yêu cầu login + quyền
router.use(protect, CAN_MANAGE_BLOG_CATEGORIES)

/* ==========================================
   GET ALL CATEGORIES
========================================== */
router.get('/', async (_req, res) => {
  const categories = await BlogCategory.find().sort({ createdAt: -1 })
  res.json(categories)
})

/* ==========================================
   CREATE CATEGORY
========================================== */
router.post('/', async (req, res) => {
  const { name, slug } = req.body

  const existed = await BlogCategory.findOne({ slug })
  if (existed) {
    return res.status(400).json({ error: 'Slug đã tồn tại' })
  }

  const created = await BlogCategory.create({
    name,
    slug
  })

  res.status(201).json(created)
})

/* ==========================================
   GET A CATEGORY
========================================== */
router.get('/:id', async (req, res) => {
  const cat = await BlogCategory.findById(req.params.id)

  if (!cat) {
    return res.status(404).json({ error: 'Không tìm thấy danh mục' })
  }

  res.json(cat)
})

/* ==========================================
   UPDATE CATEGORY
========================================== */
router.put('/:id', async (req, res) => {
  const updated = await BlogCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )

  if (!updated) {
    return res.status(404).json({ error: 'Không tìm thấy danh mục' })
  }

  res.json(updated)
})

/* ==========================================
   DELETE CATEGORY
========================================== */
router.delete('/:id', async (req, res) => {
  const deleted = await BlogCategory.findByIdAndDelete(req.params.id)

  if (!deleted) {
    return res.status(404).json({ error: 'Không tìm thấy danh mục' })
  }

  res.json({ ok: true })
})

export default router

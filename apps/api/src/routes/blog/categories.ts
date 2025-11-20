import express from 'express'
import { protect, adminOnly } from '../../middleware/auth'
import BlogCategory from '../../models/BlogCategory'

const router = express.Router()

// Tất cả route blog category đều cần admin
router.use(protect, adminOnly)

// GET: danh sách category
router.get('/', async (_req, res) => {
  const categories = await BlogCategory.find().sort({ createdAt: -1 })
  res.json(categories)
})

// POST: tạo category mới
router.post('/', async (req, res) => {
  const { name, slug } = req.body

  const created = await BlogCategory.create({
    name,
    slug
  })

  res.status(201).json(created)
})

// GET: chi tiết 1 category theo id
router.get('/:id', async (req, res) => {
  const cat = await BlogCategory.findById(req.params.id)

  if (!cat) {
    return res.status(404).json({ message: 'Không tìm thấy danh mục' })
  }

  res.json(cat)
})

// PUT: cập nhật category
router.put('/:id', async (req, res) => {
  const updated = await BlogCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )

  if (!updated) {
    return res.status(404).json({ message: 'Không tìm thấy danh mục' })
  }

  res.json(updated)
})

// DELETE: xoá category
router.delete('/:id', async (req, res) => {
  const deleted = await BlogCategory.findByIdAndDelete(req.params.id)

  if (!deleted) {
    return res.status(404).json({ message: 'Không tìm thấy danh mục' })
  }

  res.json({ ok: true })
})

export default router

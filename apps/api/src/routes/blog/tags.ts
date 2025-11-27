import express from 'express'
import BlogTag from '../../models/BlogTag'
import { protect } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/requirePermissions'

const router = express.Router()

// ⭐ Quyền quản lý TAG
const CAN_MANAGE_BLOG_TAGS = requirePermissions('manage_blog_tags')

router.use(protect, CAN_MANAGE_BLOG_TAGS)

// Helper tạo slug tự động
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu tiếng Việt
    .replace(/[^a-z0-9]+/g, '-') // thay ký tự lạ thành "-"
    .replace(/^-+|-+$/g, '') // xoá - đầu/cuối
}

/* ================================
   GET ALL TAGS
================================ */
router.get('/', async (_req, res) => {
  const tags = await BlogTag.find().sort({ name: 1 })
  res.json(tags)
})

/* ================================
   CREATE TAG
================================ */
router.post('/', async (req, res) => {
  const { name } = req.body

  if (!name) {
    return res.status(400).json({ message: 'Tên tag không được để trống' })
  }

  const slug = generateSlug(name)

  const created = await BlogTag.create({ name, slug })
  res.status(201).json(created)
})

/* ================================
   GET TAG BY ID
================================ */
router.get('/:id', async (req, res) => {
  const tag = await BlogTag.findById(req.params.id)
  if (!tag) return res.status(404).json({ message: 'Không tìm thấy tag' })
  res.json(tag)
})

/* ================================
   UPDATE TAG
================================ */
router.put('/:id', async (req, res) => {
  const { name } = req.body

  if (!name)
    return res.status(400).json({ message: 'Tên tag không được để trống' })

  const slug = generateSlug(name)

  const updated = await BlogTag.findByIdAndUpdate(
    req.params.id,
    { name, slug },
    { new: true }
  )

  if (!updated) return res.status(404).json({ message: 'Không tìm thấy tag' })

  res.json(updated)
})

/* ================================
   DELETE TAG
================================ */
router.delete('/:id', async (req, res) => {
  const deleted = await BlogTag.findByIdAndDelete(req.params.id)

  if (!deleted) return res.status(404).json({ message: 'Không tìm thấy tag' })

  res.json({ ok: true })
})

export default router

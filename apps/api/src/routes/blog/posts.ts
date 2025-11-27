import express from 'express'
import BlogPost from '../../models/BlogPost'
import { protect } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/requirePermissions'

const router = express.Router()

// ⭐ Quyền CRUD bài viết blog
const CAN_MANAGE_BLOG_POSTS = requirePermissions('manage_blog_posts')

// Áp dụng middleware cho toàn bộ route
router.use(protect, CAN_MANAGE_BLOG_POSTS)

/* ================================
   GET ALL POSTS
================================ */
router.get('/', async (req, res) => {
  const { search, status, category, tag } = req.query

  const filter: any = {}

  if (search) {
    const keyword = String(search).trim()
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { slug: { $regex: keyword, $options: 'i' } },
      { excerpt: { $regex: keyword, $options: 'i' } }
    ]
  }

  if (status && status !== 'all') filter.status = status
  if (category) filter.categories = category
  if (tag) filter.tags = tag

  const posts = await BlogPost.find(filter)
    .populate('categories')
    .populate('tags')
    .populate('author', 'name email')
    .sort({ createdAt: -1 })

  res.json(posts)
})

/* ================================
   CREATE POST
================================ */
router.post('/', async (req, res) => {
  const post = await BlogPost.create({
    ...req.body,
    author: (req as any).user?.id // ⭐ Tự động set author
  })

  res.status(201).json(post)
})

/* ================================
   GET DETAIL
================================ */
router.get('/:id', async (req, res) => {
  const post = await BlogPost.findById(req.params.id)
    .populate('categories')
    .populate('tags')
    .populate('author', 'name email')

  if (!post) return res.status(404).json({ error: 'Not found' })

  res.json(post)
})

/* ================================
   UPDATE POST
================================ */
router.put('/:id', async (req, res) => {
  const updated = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  })

  if (!updated) return res.status(404).json({ error: 'Not found' })

  res.json(updated)
})

/* ================================
   DELETE POST
================================ */
router.delete('/:id', async (req, res) => {
  const deleted = await BlogPost.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ error: 'Not found' })

  res.json({ ok: true })
})

export default router

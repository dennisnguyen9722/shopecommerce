import express from 'express'
import BlogPost from '../../models/BlogPost'
import { protect, adminOnly } from '../../middleware/auth'

const router = express.Router()
router.use(protect, adminOnly)

// GET all posts
router.get('/', async (req, res) => {
  const { search, status, category, tag } = req.query

  const filter: any = {}

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } }
    ]
  }

  if (status) filter.status = status
  if (category) filter.categories = category
  if (tag) filter.tags = tag

  const posts = await BlogPost.find(filter)
    .populate('categories')
    .populate('tags')
    .populate('author')
    .sort({ createdAt: -1 })

  res.json(posts)
})

// CREATE
router.post('/', async (req, res) => {
  const post = await BlogPost.create(req.body)
  res.status(201).json(post)
})

// GET detail
router.get('/:id', async (req, res) => {
  const post = await BlogPost.findById(req.params.id)
    .populate('categories')
    .populate('tags')
    .populate('author')

  if (!post) return res.status(404).json({ message: 'Not found' })

  res.json(post)
})

// UPDATE
router.put('/:id', async (req, res) => {
  const updated = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  })
  res.json(updated)
})

// DELETE
router.delete('/:id', async (req, res) => {
  await BlogPost.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

export default router

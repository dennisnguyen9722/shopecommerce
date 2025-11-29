import express from 'express'
import BlogPost from '../../models/BlogPost'

const router = express.Router()

router.get('/latest', async (req, res) => {
  const limit = Number(req.query.limit) || 3
  const posts = await BlogPost.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('_id title slug excerpt thumbnailUrl createdAt')
  res.json(posts)
})

router.get('/post/:slug', async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug }).select(
    '_id title slug content thumbnailUrl createdAt'
  )
  res.json(post)
})

export default router

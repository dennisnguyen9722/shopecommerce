import express from 'express'
import Review from '../../models/Review'
import Product from '../../models/Product'
import mongoose from 'mongoose'

const router = express.Router()

// ================================
// 1️⃣ GET REVIEWS BY PRODUCT
// ================================
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params

    const reviews = await Review.find({
      product: productId,
      status: 'approved'
    })
      .sort({ createdAt: -1 })
      .lean()

    return res.json({ reviews })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

// ================================
// 2️⃣ CREATE REVIEW
// ================================
router.post('/', async (req, res) => {
  try {
    const {
      productId,
      rating,
      content,
      images,
      customerEmail,
      customerName,
      isAnonymous
    } = req.body

    // Basic spam protection
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const lastReview = await Review.findOne({
      ipAddress: ip
    }).sort({ createdAt: -1 })

    if (lastReview) {
      const diff = Date.now() - new Date(lastReview.createdAt).getTime()
      if (diff < 20 * 1000) {
        return res.status(429).json({
          error: 'Bạn đang gửi quá nhanh. Vui lòng thử lại sau.'
        })
      }
    }

    const review = await Review.create({
      product: productId,
      rating,
      content,
      images: images || [],
      customerEmail,
      customerName,
      isAnonymous,
      status: 'pending', // Quan trọng: chờ duyệt
      ipAddress: ip
    })

    return res.json({ message: 'Review submitted, pending approval', review })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

// ================================
// 3️⃣ LIKE / DISLIKE
// ================================
router.post('/:id/react', async (req, res) => {
  try {
    const { type } = req.body // like/dislike

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' })
    }

    const update =
      type === 'like' ? { $inc: { likes: 1 } } : { $inc: { dislikes: 1 } }

    const review = await Review.findByIdAndUpdate(req.params.id, update, {
      new: true
    })

    return res.json(review)
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

// ================================
// 4️⃣ GET SUMMARY
// ================================
router.get('/:productId/summary', async (req, res) => {
  try {
    const { productId } = req.params

    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ])

    const total = stats.reduce((s, r) => s + r.count, 0)
    const average =
      total === 0
        ? 0
        : (stats.reduce((s, r) => s + r._id * r.count, 0) / total).toFixed(1)

    return res.json({ average, total, stats })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router

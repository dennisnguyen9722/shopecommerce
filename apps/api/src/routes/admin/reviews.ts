import express, { Request, Response } from 'express'
import Review from '../../models/Review'

const router = express.Router()

// ======================================================
// GET LIST (filter + pagination)
// ======================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search = '', status, page = 1, limit = 10 } = req.query as any

    const pageNum = Number(page)
    const pageSize = Number(limit)

    const query: any = {}

    // Search theo content + email + name
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ]
    }

    // Status filter
    if (status && ['approved', 'pending', 'rejected'].includes(status)) {
      query.status = status
    }

    const total = await Review.countDocuments(query)

    const items = await Review.find(query)
      .populate('product', '_id name images')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)

    return res.json({
      items,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / pageSize)
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// ======================================================
// GET DETAIL
// ======================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id).populate(
      'product',
      '_id name images'
    )

    if (!review)
      return res.status(404).json({ error: 'Không tìm thấy đánh giá' })

    return res.json(review)
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

// ======================================================
// UPDATE STATUS
// ======================================================
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' })
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!review)
      return res.status(404).json({ error: 'Không tìm thấy đánh giá' })

    return res.json(review)
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

// ======================================================
// DELETE REVIEW
// ======================================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id)

    if (!review)
      return res.status(404).json({ error: 'Không tìm thấy đánh giá' })

    return res.json({ message: 'Đã xoá đánh giá' })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

// ======================================================
// ⭐ ADMIN REPLY
// ======================================================
router.post('/:id/reply', async (req: Request, res: Response) => {
  try {
    const { content } = req.body

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Nội dung không được để trống' })
    }

    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Review không tồn tại' })

    const reply = {
      adminId: null,
      adminName: 'Admin', // Hoặc lấy từ req.user.name nếu có
      content,
      createdAt: new Date()
    }

    review.replies.push(reply)
    await review.save()

    // 👇 THÊM DÒNG NÀY: Để biến product ID thành product Object
    await review.populate('product', '_id name images')

    return res.json(review)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router

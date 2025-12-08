import express, { Request, Response } from 'express'
import ProductReview from '../../models/ProductReview'
import Order from '../../models/Order'
import { protect } from '../../middleware/auth'
import { upload } from '../../config/multer'
import uploadStream from '../../utils/cloudinary'

const router = express.Router()

// =========================================================
// 1. CHECK QUYỀN (Việt hóa thông báo)
// =========================================================
router.get(
  '/can-review/:productId',
  protect,
  async (req: Request, res: Response) => {
    try {
      const { productId } = req.params
      const customerId = (req as any).user.id

      const order = await Order.findOne({
        customer: customerId,
        'items.product': productId,
        status: 'delivered'
      })

      if (!order) {
        return res.json({
          success: true,
          canReview: false,
          reason:
            'Bạn cần mua và nhận hàng thành công sản phẩm này trước khi đánh giá.'
        })
      }

      const existingReview = await ProductReview.findOne({
        product: productId,
        customer: customerId,
        order: order._id
      })

      if (existingReview) {
        return res.json({
          success: true,
          canReview: false,
          reason: 'Bạn đã đánh giá sản phẩm này rồi.',
          existingReview
        })
      }

      res.json({
        success: true,
        canReview: true,
        orderId: order._id
      })
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: 'Lỗi máy chủ: ' + error.message })
    }
  }
)

// =========================================================
// 2. GET REVIEWS (Giữ nguyên logic)
// =========================================================
router.get('/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params
    const {
      page = 1,
      limit = 10,
      rating,
      sort = '-createdAt',
      verified = false
    } = req.query

    const query: any = { product: productId, isApproved: true }

    if (rating) query.rating = parseInt(rating as string)
    if (verified === 'true') query.isVerifiedPurchase = true

    let sortOption: any = { createdAt: -1 }
    // ... (Giữ nguyên logic sort của bạn) ...
    switch (sort) {
      case '-createdAt':
        sortOption = { createdAt: -1 }
        break
      case 'createdAt':
        sortOption = { createdAt: 1 }
        break
      case '-helpful':
        sortOption = { helpfulCount: -1, createdAt: -1 }
        break
      case '-rating':
        sortOption = { rating: -1, createdAt: -1 }
        break
      case 'rating':
        sortOption = { rating: 1, createdAt: -1 }
        break
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [reviews, total] = await Promise.all([
      ProductReview.find(query)
        .populate('customer', 'name email avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ProductReview.countDocuments(query)
    ])

    const summary = await (ProductReview as any).calculateAverageRating(
      productId
    )

    res.json({
      success: true,
      data: {
        reviews,
        summary,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// =========================================================
// 3. CREATE REVIEW (Việt hóa thông báo)
// =========================================================
router.post(
  '/',
  protect,
  upload.array('images', 5),
  async (req: Request, res: Response) => {
    try {
      const { productId, rating, title, comment, pros, cons, orderId } =
        req.body
      const customerId = (req as any).user.id

      const order = await Order.findOne({
        _id: orderId,
        customer: customerId,
        'items.product': productId,
        status: 'delivered'
      })

      if (!order) {
        return res.status(400).json({
          success: false,
          message: 'Đơn hàng không hợp lệ hoặc chưa được giao thành công.'
        })
      }

      const existingReview = await ProductReview.findOne({
        product: productId,
        customer: customerId,
        order: orderId
      })

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã đánh giá sản phẩm này rồi.'
        })
      }

      let imageUrls: string[] = []
      if (req.files && Array.isArray(req.files)) {
        const uploadPromises = req.files.map((file) =>
          uploadStream(file.buffer, 'ecommerce/reviews').then(
            (result) => result.url
          )
        )
        imageUrls = await Promise.all(uploadPromises)
      }

      const review = await ProductReview.create({
        product: productId,
        customer: customerId,
        order: orderId,
        rating: Number(rating),
        title,
        comment,
        images: imageUrls,
        pros: pros ? JSON.parse(pros) : [],
        cons: cons ? JSON.parse(cons) : [],
        isVerifiedPurchase: true,
        isApproved: false
      })

      const populatedReview = await ProductReview.findById(review._id).populate(
        'customer',
        'name email'
      )

      res.status(201).json({
        success: true,
        message: 'Gửi đánh giá thành công! Vui lòng chờ duyệt.',
        data: populatedReview
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
)

// =========================================================
// 4. PUT REVIEW (Việt hóa)
// =========================================================
router.put('/:reviewId', protect, async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params
    const customerId = (req as any).user.id
    const { rating, title, comment, pros, cons } = req.body

    const review = await ProductReview.findOne({
      _id: reviewId,
      customer: customerId
    })

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy đánh giá.' })
    }

    review.rating = rating || review.rating
    review.title = title || review.title
    review.comment = comment || review.comment
    review.pros = pros || review.pros
    review.cons = cons || review.cons
    review.isApproved = false

    await review.save()
    const updatedReview = await ProductReview.findById(reviewId).populate(
      'customer',
      'name email'
    )

    res.json({
      success: true,
      message: 'Cập nhật đánh giá thành công.',
      data: updatedReview
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// =========================================================
// 5. DELETE REVIEW (Việt hóa)
// =========================================================
router.delete('/:reviewId', protect, async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params
    const customerId = (req as any).user.id

    const review = await ProductReview.findOneAndDelete({
      _id: reviewId,
      customer: customerId
    })

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy đánh giá.' })
    }

    res.json({ success: true, message: 'Xóa đánh giá thành công.' })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// =========================================================
// 6. VOTE HELPFUL (Việt hóa)
// =========================================================
router.post(
  '/:reviewId/helpful',
  protect,
  async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.params
      const customerId = (req as any).user.id

      const review = await ProductReview.findById(reviewId)

      if (!review) {
        return res
          .status(404)
          .json({ success: false, message: 'Không tìm thấy đánh giá.' })
      }

      const alreadyVoted = review.helpfulVotes.includes(customerId)

      if (alreadyVoted) {
        review.helpfulVotes = review.helpfulVotes.filter(
          (id) => id.toString() !== customerId.toString()
        )
        review.helpfulCount = Math.max(0, review.helpfulCount - 1)
      } else {
        review.helpfulVotes.push(customerId)
        review.helpfulCount += 1
      }

      await review.save()

      res.json({
        success: true,
        message: alreadyVoted ? 'Đã bỏ thích.' : 'Đã thích đánh giá.',
        data: {
          helpfulCount: review.helpfulCount,
          voted: !alreadyVoted
        }
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
)

export default router

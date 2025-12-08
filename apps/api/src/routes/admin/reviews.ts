// backend/src/routes/admin/reviews.ts
import express, { Request, Response } from 'express'
import ProductReview from '../../models/ProductReview'
import { protect } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/requirePermissions'

const router = express.Router()

// =========================================================
// 1. GET: Review statistics (Dashboard) - PHẢI ĐẶT TRƯỚC /:reviewId
// =========================================================
router.get(
  '/stats/overview',
  protect,
  requirePermissions('settings.view_analytics'),
  async (req: Request, res: Response) => {
    try {
      const [
        totalReviews,
        pendingReviews,
        approvedReviews,
        averageRatingStats,
        recentReviews
      ] = await Promise.all([
        ProductReview.countDocuments(),
        ProductReview.countDocuments({ isApproved: false }),
        ProductReview.countDocuments({ isApproved: true }),
        ProductReview.aggregate([
          { $match: { isApproved: true } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating' },
              distribution: { $push: '$rating' }
            }
          }
        ]),
        ProductReview.find({ isApproved: false })
          .populate('customer', 'name email')
          .populate('product', 'name slug')
          .sort('-createdAt')
          .limit(5)
          .lean()
      ])

      const ratingDist =
        averageRatingStats[0]?.distribution.reduce(
          (acc: any, rating: number) => {
            acc[rating] = (acc[rating] || 0) + 1
            return acc
          },
          {}
        ) || {}

      res.json({
        success: true,
        data: {
          total: totalReviews,
          pending: pendingReviews,
          approved: approvedReviews,
          averageRating: averageRatingStats[0]?.avgRating || 0,
          ratingDistribution: {
            5: ratingDist[5] || 0,
            4: ratingDist[4] || 0,
            3: ratingDist[3] || 0,
            2: ratingDist[2] || 0,
            1: ratingDist[1] || 0
          },
          recentPending: recentReviews
        }
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
)

// =========================================================
// 2. POST: Bulk approve reviews - PHẢI ĐẶT TRƯỚC /:reviewId
// =========================================================
router.post(
  '/bulk/approve',
  protect,
  requirePermissions('reviews.manage'),
  async (req: Request, res: Response) => {
    try {
      const { reviewIds } = req.body

      if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Review IDs array is required'
        })
      }

      // Approve từng review để trigger hook update Product rating
      await Promise.all(
        reviewIds.map(async (id) => {
          const review = await ProductReview.findById(id)
          if (review) {
            review.isApproved = true
            await review.save()
          }
        })
      )

      res.json({
        success: true,
        message: `${reviewIds.length} reviews approved successfully`,
        data: {
          count: reviewIds.length
        }
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
)

// =========================================================
// 3. POST: Bulk delete reviews - PHẢI ĐẶT TRƯỚC /:reviewId
// =========================================================
router.post(
  '/bulk/delete',
  protect,
  requirePermissions('reviews.manage'),
  async (req: Request, res: Response) => {
    try {
      const { reviewIds } = req.body

      if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Review IDs array is required'
        })
      }

      const result = await ProductReview.deleteMany({ _id: { $in: reviewIds } })

      res.json({
        success: true,
        message: `${result.deletedCount} reviews deleted successfully`,
        data: {
          deletedCount: result.deletedCount
        }
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
)

// =========================================================
// 4. GET: Lấy tất cả reviews (Admin)
// =========================================================
router.get(
  '/',
  protect,
  requirePermissions('reviews.read'),
  async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        rating,
        search,
        sortBy = '-createdAt'
      } = req.query

      const query: any = {}

      // Filter by approval status
      if (status === 'pending') {
        query.isApproved = false
      } else if (status === 'approved') {
        query.isApproved = true
      }

      // Filter by rating
      if (rating) {
        query.rating = parseInt(rating as string)
      }

      // Search in title or comment
      if (search) {
        query.$or = [
          { title: { $regex: search as string, $options: 'i' } },
          { comment: { $regex: search as string, $options: 'i' } }
        ]
      }

      const skip = (Number(page) - 1) * Number(limit)

      const [reviews, total, pendingCount] = await Promise.all([
        ProductReview.find(query)
          .populate('customer', 'name email')
          .populate('product', 'name slug images')
          .populate('adminReply.repliedBy', 'name email')
          .sort(sortBy as string)
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        ProductReview.countDocuments(query),
        ProductReview.countDocuments({ isApproved: false })
      ])

      res.json({
        success: true,
        data: {
          reviews,
          stats: {
            pending: pendingCount,
            total
          },
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
)

// =========================================================
// 5. GET: Lấy chi tiết 1 review (Admin)
// =========================================================
router.get(
  '/:reviewId',
  protect,
  requirePermissions('reviews.read'),
  async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.params

      const review = await ProductReview.findById(reviewId)
        .populate('customer', 'name email phone')
        .populate('product', 'name slug images price')
        .populate('order', 'orderNumber createdAt')
        .populate('adminReply.repliedBy', 'name email')

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        })
      }

      res.json({
        success: true,
        data: review
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
)

// =========================================================
// 6. PUT: Approve/Reject review
// =========================================================
router.put(
  '/:reviewId/status',
  protect,
  requirePermissions('reviews.manage'),
  async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.params
      const { isApproved } = req.body

      const review = await ProductReview.findById(reviewId)

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        })
      }

      review.isApproved = isApproved
      await review.save()

      const updatedReview = await ProductReview.findById(reviewId)
        .populate('customer', 'name email')
        .populate('product', 'name slug')

      res.json({
        success: true,
        message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
        data: updatedReview
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
)

// =========================================================
// 7. POST: Admin reply to review
// =========================================================
router.post(
  '/:reviewId/reply',
  protect,
  requirePermissions('reviews.manage'),
  async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.params
      const { message } = req.body
      const adminId = (req as any).user.id

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Reply message is required'
        })
      }

      const review = await ProductReview.findById(reviewId)

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        })
      }

      review.adminReply = {
        message: message.trim(),
        repliedBy: adminId,
        repliedAt: new Date()
      }

      await review.save()

      const updatedReview = await ProductReview.findById(reviewId)
        .populate('customer', 'name email')
        .populate('product', 'name slug')
        .populate('adminReply.repliedBy', 'name email')

      res.json({
        success: true,
        message: 'Reply added successfully',
        data: updatedReview
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
)

// =========================================================
// 8. PUT: Update admin reply
// =========================================================
router.put(
  '/:reviewId/reply',
  protect,
  requirePermissions('reviews.manage'),
  async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.params
      const { message } = req.body
      const adminId = (req as any).user.id

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Reply message is required'
        })
      }

      const review = await ProductReview.findById(reviewId)

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        })
      }

      if (!review.adminReply) {
        return res.status(400).json({
          success: false,
          message: 'No reply exists to update'
        })
      }

      review.adminReply.message = message.trim()
      review.adminReply.repliedBy = adminId
      review.adminReply.repliedAt = new Date()

      await review.save()

      const updatedReview = await ProductReview.findById(reviewId)
        .populate('customer', 'name email')
        .populate('product', 'name slug')
        .populate('adminReply.repliedBy', 'name email')

      res.json({
        success: true,
        message: 'Reply updated successfully',
        data: updatedReview
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
)

// =========================================================
// 9. DELETE: Xóa admin reply
// =========================================================
router.delete(
  '/:reviewId/reply',
  protect,
  requirePermissions('reviews.manage'),
  async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.params

      const review = await ProductReview.findById(reviewId)

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        })
      }

      review.adminReply = undefined
      await review.save()

      res.json({
        success: true,
        message: 'Reply deleted successfully'
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
)

// =========================================================
// 10. DELETE: Admin xóa review
// =========================================================
router.delete(
  '/:reviewId',
  protect,
  requirePermissions('reviews.delete'),
  async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.params

      const review = await ProductReview.findByIdAndDelete(reviewId)

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        })
      }

      res.json({
        success: true,
        message: 'Review deleted successfully'
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
)

export default router

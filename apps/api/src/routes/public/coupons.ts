import express from 'express'
import Coupon from '../../models/Coupon'
import CouponUsage from '../../models/CouponUsage'
import Customer from '../../models/Customer'
import Order from '../../models/Order'
import mongoose from 'mongoose'

const router = express.Router()

// =====================================================================
// ⭐ 1. Validate coupon code
// =====================================================================
router.post('/validate', async (req, res) => {
  try {
    const { code, customerId, cartTotal, cartItems } = req.body

    if (!code) {
      return res.status(400).json({
        valid: false,
        message: 'Vui lòng nhập mã giảm giá'
      })
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase()
    })
      .populate('applicableProducts')
      .populate('applicableCategories')

    if (!coupon) {
      return res.status(404).json({
        valid: false,
        message: 'Mã giảm giá không tồn tại'
      })
    }

    // Active check
    if (!coupon.isActive) {
      return res.status(400).json({
        valid: false,
        message: 'Mã giảm giá đã bị vô hiệu hóa'
      })
    }

    // Date check
    const now = new Date()
    if (now < coupon.startDate) {
      return res.status(400).json({
        valid: false,
        message: 'Mã giảm giá chưa có hiệu lực'
      })
    }

    if (now > coupon.endDate) {
      return res.status(400).json({
        valid: false,
        message: 'Mã giảm giá đã hết hạn'
      })
    }

    // Usage limit - global
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        valid: false,
        message: 'Mã giảm giá đã hết lượt sử dụng'
      })
    }

    // Usage per user
    if (customerId) {
      const customerUsageCount = await CouponUsage.countDocuments({
        coupon: coupon._id,
        customer: customerId
      })

      if (
        coupon.usageLimitPerUser &&
        customerUsageCount >= coupon.usageLimitPerUser
      ) {
        return res.status(400).json({
          valid: false,
          message: 'Bạn đã sử dụng hết lượt áp dụng mã này'
        })
      }

      // Customer type rule
      if (coupon.customerType !== 'all') {
        const customer = await Customer.findById(customerId)
        const orderCount = await Order.countDocuments({
          customerEmail: customer?.email
        })

        if (coupon.customerType === 'new' && orderCount > 0) {
          return res.status(400).json({
            valid: false,
            message: 'Mã giảm giá chỉ dành cho khách hàng mới'
          })
        }

        if (coupon.customerType === 'existing' && orderCount === 0) {
          return res.status(400).json({
            valid: false,
            message: 'Mã giảm giá chỉ dành cho khách hàng cũ'
          })
        }
      }

      // ⭐ NEW: firstPurchaseOnly
      if (coupon.firstPurchaseOnly) {
        const orderCount = await Order.countDocuments({
          customer: customerId
        })

        if (orderCount > 0) {
          return res.status(400).json({
            valid: false,
            message: 'Mã giảm giá chỉ áp dụng cho đơn hàng đầu tiên'
          })
        }
      }
    }

    // Min order value
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        valid: false,
        message: `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString(
          'vi-VN'
        )}₫ để áp dụng mã này`
      })
    }

    // Applicable product rule
    if (cartItems && cartItems.length > 0) {
      // SAFETY: ensure arrays exist before using .length / .map
      const applicableProducts = Array.isArray(coupon.applicableProducts)
        ? coupon.applicableProducts
        : []
      const applicableCategories = Array.isArray(coupon.applicableCategories)
        ? coupon.applicableCategories
        : []

      // Product restriction
      if (applicableProducts.length > 0) {
        const ids = applicableProducts.map((p: any) =>
          p && p._id ? p._id.toString() : p.toString()
        )

        const match = cartItems.some((item: any) =>
          ids.includes(item.productId)
        )

        if (!match) {
          return res.status(400).json({
            valid: false,
            message: 'Mã giảm giá không áp dụng cho sản phẩm trong giỏ hàng'
          })
        }
      }

      // Category restriction
      if (applicableCategories.length > 0) {
        const ids = applicableCategories.map((c: any) =>
          c && c._id ? c._id.toString() : c.toString()
        )

        const match = cartItems.some((item: any) =>
          ids.includes(item.categoryId)
        )

        if (!match) {
          return res.status(400).json({
            valid: false,
            message:
              'Mã giảm giá không áp dụng cho danh mục sản phẩm trong giỏ hàng'
          })
        }
      }

      // ⭐ NEW: excludeDiscountedProducts
      if (coupon.excludeDiscountedProducts) {
        const hasDiscounted = cartItems.some((item: any) => {
          return item.compareAtPrice && item.compareAtPrice > item.price
        })

        if (hasDiscounted) {
          return res.status(400).json({
            valid: false,
            message: 'Mã giảm giá không áp dụng cho sản phẩm đang được giảm giá'
          })
        }
      }
    }

    // ⭐ NEW: maxUsagePerOrder
    // Note: this setting usually restricts usage count per order; we keep a simple check
    if (coupon.maxUsagePerOrder && coupon.maxUsagePerOrder < 1) {
      return res.status(400).json({
        valid: false,
        message: 'Mã giảm giá không thể dùng nhiều lần trong 1 đơn hàng'
      })
    }

    // Calculate discount
    let discountAmount = 0

    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100
      if (
        coupon.maxDiscountAmount &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount
      }
    }

    if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(coupon.discountValue, cartTotal)
    }

    if (coupon.discountType === 'free_shipping') {
      discountAmount = 0 // FE sẽ xử lý
    }

    res.json({
      valid: true,
      message: 'Mã giảm giá hợp lệ',
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount)
      }
    })
  } catch (error) {
    console.error('Validate coupon error:', error)
    res.status(500).json({
      valid: false,
      message: 'Lỗi khi kiểm tra mã giảm giá'
    })
  }
})

// =====================================================================
// ⭐ 2. Lấy danh sách coupon khả dụng
// =====================================================================
router.get('/available', async (req, res) => {
  try {
    const { customerId } = req.query
    const now = new Date()

    const query: any = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    }

    let coupons = await Coupon.find(query)
      .select(
        'code description discountType discountValue maxDiscountAmount minOrderAmount endDate'
      )
      .sort({ createdAt: -1 })

    // Usage per user
    if (customerId) {
      const usage = await CouponUsage.aggregate([
        {
          $match: {
            customer: new mongoose.Types.ObjectId(customerId as string)
          }
        },
        {
          $group: {
            _id: '$coupon',
            count: { $sum: 1 }
          }
        }
      ])

      const map = new Map(usage.map((u) => [u._id.toString(), u.count]))

      coupons = coupons.filter((coupon) => {
        const used = map.get(coupon._id.toString()) || 0
        return !coupon.usageLimitPerUser || used < coupon.usageLimitPerUser
      })
    }

    res.json({ coupons })
  } catch (error) {
    console.error('Get available coupons error:', error)
    res.status(500).json({ message: 'Lỗi khi lấy danh sách mã giảm giá' })
  }
})

// =====================================================================
// ⭐ 3. Lấy coupon auto-apply
// =====================================================================
router.get('/auto-apply', async (req, res) => {
  try {
    const { cartTotal } = req.query
    const now = new Date()

    const query: any = {
      isActive: true,
      autoApply: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    }

    if (cartTotal) {
      query.minOrderAmount = { $lte: Number(cartTotal) }
    }

    const coupons = await Coupon.find(query)
      .sort({ discountValue: -1 })
      .limit(1)

    res.json({ coupon: coupons[0] || null })
  } catch (error) {
    console.error('Get auto-apply coupon error:', error)
    res.status(500).json({ message: 'Lỗi khi lấy mã tự động áp dụng' })
  }
})

export default router

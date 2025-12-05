import express from 'express'
import Coupon from '../../models/Coupon'
import CouponUsage from '../../models/CouponUsage'
import { protect } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/requirePermissions'

const router = express.Router()

// Áp dụng auth & permission
router.use(protect)
router.use(requirePermissions('manage_coupons'))

// ================================================================
// 1. Lấy danh sách tất cả coupon
// ================================================================
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query

    const query: any = {}

    if (search) {
      query.code = { $regex: search, $options: 'i' }
    }

    if (status === 'active') {
      query.isActive = true
      query.startDate = { $lte: new Date() }
      query.endDate = { $gte: new Date() }
    } else if (status === 'inactive') {
      query.isActive = false
    } else if (status === 'expired') {
      query.endDate = { $lt: new Date() }
    }

    const coupons = await Coupon.find(query)
      .populate('applicableProducts', 'name')
      .populate('applicableCategories', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Coupon.countDocuments(query)

    res.json({
      coupons,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// ================================================================
// 2. Lấy chi tiết 1 coupon
// ================================================================
router.get('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('applicableProducts', 'name slug')
      .populate('applicableCategories', 'name slug')

    if (!coupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' })
    }

    const usageStats = await CouponUsage.aggregate([
      { $match: { coupon: coupon._id } },
      {
        $group: {
          _id: null,
          totalUsage: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' }
        }
      }
    ])

    res.json({
      coupon,
      stats: usageStats[0] || { totalUsage: 0, totalDiscount: 0 }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// ================================================================
// 3. Tạo coupon mới
// ================================================================
router.post('/', async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      usageLimit,
      usageLimitPerUser,
      startDate,
      endDate,
      applicableProducts,
      applicableCategories,
      customerType,
      autoApply,
      firstPurchaseOnly, // ⭐ NEW
      excludeDiscountedProducts, // ⭐ NEW
      maxUsagePerOrder // ⭐ NEW
    } = req.body

    if (
      !code ||
      !description ||
      !discountType ||
      !discountValue ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() })
    if (existingCoupon) {
      return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' })
    }

    if (discountType === 'percentage' && discountValue > 100) {
      return res
        .status(400)
        .json({ message: 'Phần trăm giảm không được vượt quá 100%' })
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message: 'Ngày kết thúc phải sau ngày bắt đầu'
      })
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      usageLimit,
      usageLimitPerUser,
      startDate,
      endDate,
      applicableProducts,
      applicableCategories,
      customerType,
      autoApply,
      firstPurchaseOnly, // ⭐ NEW
      excludeDiscountedProducts, // ⭐ NEW
      maxUsagePerOrder // ⭐ NEW
    })

    await coupon.save()

    res.status(201).json({
      message: 'Tạo mã giảm giá thành công',
      coupon
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// ================================================================
// 4. Cập nhật coupon
// ================================================================
router.put('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)

    if (!coupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' })
    }

    const {
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      usageLimit,
      usageLimitPerUser,
      startDate,
      endDate,
      isActive,
      applicableProducts,
      applicableCategories,
      customerType,
      autoApply,
      firstPurchaseOnly, // ⭐ NEW
      excludeDiscountedProducts, // ⭐ NEW
      maxUsagePerOrder // ⭐ NEW
    } = req.body

    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({
        message: 'Phần trăm giảm không được vượt quá 100%'
      })
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message: 'Ngày kết thúc phải sau ngày bắt đầu'
      })
    }

    if (description) coupon.description = description
    if (discountType) coupon.discountType = discountType
    if (discountValue !== undefined) coupon.discountValue = discountValue
    if (maxDiscountAmount !== undefined)
      coupon.maxDiscountAmount = maxDiscountAmount
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit
    if (usageLimitPerUser !== undefined)
      coupon.usageLimitPerUser = usageLimitPerUser
    if (startDate) coupon.startDate = startDate
    if (endDate) coupon.endDate = endDate
    if (isActive !== undefined) coupon.isActive = isActive
    if (applicableProducts) coupon.applicableProducts = applicableProducts
    if (applicableCategories) coupon.applicableCategories = applicableCategories
    if (customerType) coupon.customerType = customerType
    if (autoApply !== undefined) coupon.autoApply = autoApply

    // ⭐ NEW FIELDS
    if (firstPurchaseOnly !== undefined)
      coupon.firstPurchaseOnly = firstPurchaseOnly
    if (excludeDiscountedProducts !== undefined)
      coupon.excludeDiscountedProducts = excludeDiscountedProducts
    if (maxUsagePerOrder !== undefined)
      coupon.maxUsagePerOrder = maxUsagePerOrder

    await coupon.save()

    res.json({
      message: 'Cập nhật mã giảm giá thành công',
      coupon
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// ================================================================
// 5. Xóa coupon
// ================================================================
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)

    if (!coupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' })
    }

    const usageCount = await CouponUsage.countDocuments({ coupon: coupon._id })

    if (usageCount > 0) {
      coupon.isActive = false
      await coupon.save()
      return res.json({
        message:
          'Mã giảm giá đã được vô hiệu hóa (không thể xóa vì đã có người sử dụng)'
      })
    }

    await Coupon.findByIdAndDelete(req.params.id)

    res.json({ message: 'Xóa mã giảm giá thành công' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// ================================================================
// 6. Lấy thống kê sử dụng coupon
// ================================================================
router.get('/:id/usage', async (req, res) => {
  try {
    const usageHistory = await CouponUsage.find({ coupon: req.params.id })
      .populate('customer', 'name email')
      .populate('order', 'orderNumber totalPrice')
      .sort({ usedAt: -1 })
      .limit(50)

    res.json({ usageHistory })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router

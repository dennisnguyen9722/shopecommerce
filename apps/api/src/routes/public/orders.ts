import express, { Request, Response } from 'express'
import Order from '../../models/Order'
import Notification from '../../models/Notification'
import UserReward from '../../models/UserReward'
import Reward from '../../models/Reward'
import Customer from '../../models/Customer'
import Coupon from '../../models/Coupon' // ⭐ THÊM
import CouponUsage from '../../models/CouponUsage' // ⭐ THÊM
import { io } from '../../index'
import { updateCustomerStats } from '../../utils/updateCustomerStats'
import { calculatePointsFromOrder } from '../../utils/loyaltyUtils'
import mongoose from 'mongoose' // ⭐ THÊM

const router = express.Router()

// Helper format tiền
function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN')
}

type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

// ==================================================
// ⭐ 1. VALIDATE VOUCHER (GIỮ NGUYÊN CODE CŨ)
// ==================================================
router.post('/validate-voucher', async (req: Request, res: Response) => {
  console.log('🎯 HIT validate-voucher API')

  try {
    const { voucherCode, subtotal, customerEmail } = req.body

    if (!voucherCode) {
      return res.status(400).json({ error: 'Vui lòng nhập mã giảm giá' })
    }

    const userReward = await UserReward.findOne({
      voucherCode: voucherCode.toUpperCase(),
      status: 'active'
    }).populate('rewardId')

    if (!userReward) {
      return res
        .status(400)
        .json({ error: 'Mã giảm giá không tồn tại hoặc sai ký tự' })
    }

    if (userReward.expiresAt && new Date() > new Date(userReward.expiresAt)) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết hạn sử dụng' })
    }

    const reward = userReward.rewardId as any

    if (customerEmail) {
      const customer = await Customer.findOne({
        email: customerEmail.toLowerCase()
      })

      if (userReward.customerId) {
        if (!customer) {
          return res.status(400).json({
            error:
              'Mã này dành riêng cho thành viên thân thiết. Vui lòng đăng nhập đúng email.'
          })
        }

        console.log(
          `🔍 Check Owner: VoucherOwner=${userReward.customerId.toString()} | CurrentUser=${customer._id.toString()}`
        )

        if (
          userReward.customerId.toString() !== (customer as any)._id.toString()
        ) {
          return res
            .status(400)
            .json({ error: 'Mã giảm giá này không thuộc về tài khoản của bạn' })
        }
      }
    }

    if (reward.minOrderValue && subtotal < reward.minOrderValue) {
      return res.status(400).json({
        error: `Đơn hàng cần tối thiểu ${formatCurrency(
          reward.minOrderValue
        )}₫ để dùng mã này`
      })
    }

    let discountAmount = 0
    if (reward.type === 'discount_percentage') {
      discountAmount = Math.floor((subtotal * Number(reward.value)) / 100)
      if (reward.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, reward.maxDiscountAmount)
      }
    } else if (reward.type === 'discount_fixed') {
      discountAmount = Number(reward.value)
    }

    return res.json({
      valid: true,
      discountAmount,
      code: userReward.voucherCode,
      type: reward.type,
      reward: {
        name: reward.name,
        value: reward.value
      }
    })
  } catch (err: any) {
    console.error('❌ [POST /validate-voucher] ERROR:', err)
    return res.status(500).json({ error: 'Lỗi máy chủ, vui lòng thử lại sau' })
  }
})

// ==================================================
// ⭐ 1.5. VALIDATE COUPON (MỚI - CHO HỆ THỐNG COUPON)
// ==================================================
router.post('/validate-coupon', async (req: Request, res: Response) => {
  console.log('🎯 HIT validate-coupon API')

  try {
    const { couponCode, subtotal, customerEmail, items } = req.body

    if (!couponCode) {
      return res.status(400).json({ error: 'Vui lòng nhập mã giảm giá' })
    }

    // Tìm coupon
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase()
    })
      .populate('applicableProducts')
      .populate('applicableCategories')

    if (!coupon) {
      return res.status(400).json({ error: 'Mã giảm giá không tồn tại' })
    }

    // Kiểm tra active
    if (!coupon.isActive) {
      return res.status(400).json({ error: 'Mã giảm giá đã bị vô hiệu hóa' })
    }

    // Kiểm tra thời gian
    const now = new Date()
    if (now < coupon.startDate) {
      return res.status(400).json({ error: 'Mã giảm giá chưa có hiệu lực' })
    }
    if (now > coupon.endDate) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết hạn' })
    }

    // Kiểm tra usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết lượt sử dụng' })
    }

    // Kiểm tra usage per user
    if (customerEmail) {
      const customer = await Customer.findOne({
        email: customerEmail.toLowerCase()
      })

      if (customer) {
        const customerUsageCount = await CouponUsage.countDocuments({
          coupon: coupon._id,
          customer: customer._id
        })

        if (
          coupon.usageLimitPerUser &&
          customerUsageCount >= coupon.usageLimitPerUser
        ) {
          return res
            .status(400)
            .json({ error: 'Bạn đã sử dụng hết lượt áp dụng mã này' })
        }

        // Kiểm tra loại khách hàng
        if (coupon.customerType !== 'all') {
          const orderCount = await Order.countDocuments({
            customerEmail: customer.email
          })

          if (coupon.customerType === 'new' && orderCount > 0) {
            return res
              .status(400)
              .json({ error: 'Mã giảm giá chỉ dành cho khách hàng mới' })
          }

          if (coupon.customerType === 'existing' && orderCount === 0) {
            return res
              .status(400)
              .json({ error: 'Mã giảm giá chỉ dành cho khách hàng cũ' })
          }
        }
      }
    }

    // Kiểm tra giá trị tối thiểu
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        error: `Đơn hàng cần tối thiểu ${formatCurrency(
          coupon.minOrderAmount
        )}₫ để dùng mã này`
      })
    }

    // Tính số tiền giảm
    let discountAmount = 0

    if (coupon.discountType === 'percentage') {
      discountAmount = Math.floor((subtotal * coupon.discountValue) / 100)

      if (
        coupon.maxDiscountAmount &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount
      }
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue

      if (discountAmount > subtotal) {
        discountAmount = subtotal
      }
    } else if (coupon.discountType === 'free_shipping') {
      discountAmount = 0 // Xử lý ở phần shipping
    }

    discountAmount = Math.round(discountAmount)

    return res.json({
      valid: true,
      discountAmount,
      code: coupon.code,
      type: coupon.discountType,
      coupon: {
        description: coupon.description,
        value: coupon.discountValue
      }
    })
  } catch (err: any) {
    console.error('❌ [POST /validate-coupon] ERROR:', err)
    return res.status(500).json({ error: 'Lỗi máy chủ, vui lòng thử lại sau' })
  }
})

// ==================================================
// ⭐ 2. PREVIEW ORDER (CẬP NHẬT HỖ TRỢ COUPON)
// ==================================================
router.post('/preview', async (req: Request, res: Response) => {
  try {
    const { items, customerEmail, voucherCode, couponCode } = req.body // ⭐ Thêm couponCode

    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity
    }, 0)

    let discount = 0
    let shippingFee = 30000
    let pointsWillEarn = 0
    let tier: LoyaltyTier = 'bronze'
    let voucherInfo = null
    let couponInfo = null // ⭐ THÊM

    if (customerEmail) {
      const customer = await Customer.findOne({
        email: customerEmail.toLowerCase()
      })

      if (customer) {
        tier = (customer.loyaltyTier as LoyaltyTier) || 'bronze'
        pointsWillEarn = calculatePointsFromOrder(subtotal, tier)
      }
    }

    // ⭐ XỬ LÝ VOUCHER (GIỮ NGUYÊN)
    if (voucherCode) {
      const userReward = await UserReward.findOne({
        voucherCode: voucherCode.toUpperCase(),
        status: 'active'
      }).populate('rewardId')

      const isExpired =
        userReward?.expiresAt && new Date() > new Date(userReward.expiresAt)

      if (userReward && !isExpired) {
        const reward = userReward.rewardId as any
        if (!reward.minOrderValue || subtotal >= reward.minOrderValue) {
          if (reward.type === 'discount_percentage') {
            discount = Math.floor((subtotal * Number(reward.value)) / 100)
            if (reward.maxDiscountAmount) {
              discount = Math.min(discount, reward.maxDiscountAmount)
            }
          } else if (reward.type === 'discount_fixed') {
            discount = Number(reward.value)
          } else if (reward.type === 'free_shipping') {
            shippingFee = 0
          }
          voucherInfo = { name: reward.name, type: reward.type, discount }
        }
      }
    }

    // ⭐ XỬ LÝ COUPON (MỚI)
    if (couponCode && !voucherCode) {
      // Chỉ áp dụng 1 trong 2
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true
      })

      if (coupon) {
        const now = new Date()
        const isValid =
          now >= coupon.startDate &&
          now <= coupon.endDate &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
          (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount)

        if (isValid) {
          if (coupon.discountType === 'percentage') {
            discount = Math.floor((subtotal * coupon.discountValue) / 100)
            if (coupon.maxDiscountAmount) {
              discount = Math.min(discount, coupon.maxDiscountAmount)
            }
          } else if (coupon.discountType === 'fixed') {
            discount = coupon.discountValue
            if (discount > subtotal) discount = subtotal
          } else if (coupon.discountType === 'free_shipping') {
            shippingFee = 0
          }

          couponInfo = {
            description: coupon.description,
            type: coupon.discountType,
            discount
          }
        }
      }
    }

    const total = subtotal + shippingFee - discount

    return res.json({
      subtotal,
      shippingFee,
      discount,
      total,
      pointsWillEarn,
      tier,
      voucherInfo,
      couponInfo, // ⭐ THÊM
      message:
        pointsWillEarn > 0
          ? `Bạn sẽ nhận được ${pointsWillEarn} điểm khi hoàn thành đơn này`
          : 'Đăng nhập để tích điểm'
    })
  } catch (err: any) {
    console.error('❌ [POST /preview] ERROR:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// ==================================================
// ⭐ 3. CREATE ORDER (CẬP NHẬT HỖ TRỢ COUPON)
// ==================================================
router.post('/', async (req: Request, res: Response) => {
  const session = await mongoose.startSession() // ⭐ THÊM TRANSACTION
  session.startTransaction()

  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      paymentMethod,
      items,
      subtotal,
      shippingFee = 30000,
      voucherCode,
      couponCode, // ⭐ THÊM
      discount = 0
    } = req.body

    let appliedVoucher = null
    let appliedCoupon = null // ⭐ THÊM
    let finalDiscount = discount
    let customer = null

    // Tìm customer nếu có email
    if (customerEmail) {
      customer = await Customer.findOne({
        email: customerEmail.toLowerCase()
      }).session(session)
    }

    // --- XỬ LÝ VOUCHER (GIỮ NGUYÊN) ---
    if (voucherCode) {
      const userReward = await UserReward.findOne({
        voucherCode: voucherCode.toUpperCase(),
        status: 'active'
      })
        .populate('rewardId')
        .session(session)

      const isExpired =
        userReward?.expiresAt && new Date() > new Date(userReward.expiresAt)

      if (!userReward || isExpired) {
        await session.abortTransaction()
        return res
          .status(400)
          .json({ error: 'Mã voucher không hợp lệ hoặc đã hết hạn' })
      }

      const reward = userReward.rewardId as any

      if (customerEmail && userReward.customerId) {
        if (
          customer &&
          userReward.customerId.toString() !== (customer as any)._id.toString()
        ) {
          await session.abortTransaction()
          return res.status(400).json({ error: 'Voucher không thuộc về bạn' })
        }
      }

      if (reward.type === 'discount_percentage') {
        finalDiscount = Math.floor((subtotal * Number(reward.value)) / 100)
        if (reward.maxDiscountAmount) {
          finalDiscount = Math.min(finalDiscount, reward.maxDiscountAmount)
        }
      } else if (reward.type === 'discount_fixed') {
        finalDiscount = Number(reward.value)
      }

      appliedVoucher = userReward
    }

    // --- XỬ LÝ COUPON (MỚI) ---
    if (couponCode && !voucherCode) {
      // Chỉ cho phép 1 trong 2
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase()
      }).session(session)

      if (!coupon || !coupon.isActive) {
        await session.abortTransaction()
        return res.status(400).json({ error: 'Mã coupon không hợp lệ' })
      }

      const now = new Date()
      if (now < coupon.startDate || now > coupon.endDate) {
        await session.abortTransaction()
        return res.status(400).json({ error: 'Mã coupon không còn hiệu lực' })
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        await session.abortTransaction()
        return res.status(400).json({ error: 'Mã coupon đã hết lượt sử dụng' })
      }

      // Kiểm tra usage per user
      if (customer) {
        const customerUsageCount = await CouponUsage.countDocuments({
          coupon: coupon._id,
          customer: customer._id
        }).session(session)

        if (
          coupon.usageLimitPerUser &&
          customerUsageCount >= coupon.usageLimitPerUser
        ) {
          await session.abortTransaction()
          return res
            .status(400)
            .json({ error: 'Bạn đã sử dụng hết lượt áp dụng mã này' })
        }
      }

      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        await session.abortTransaction()
        return res.status(400).json({
          error: `Đơn hàng cần tối thiểu ${formatCurrency(
            coupon.minOrderAmount
          )}₫`
        })
      }

      // Tính discount
      if (coupon.discountType === 'percentage') {
        finalDiscount = Math.floor((subtotal * coupon.discountValue) / 100)
        if (
          coupon.maxDiscountAmount &&
          finalDiscount > coupon.maxDiscountAmount
        ) {
          finalDiscount = coupon.maxDiscountAmount
        }
      } else if (coupon.discountType === 'fixed') {
        finalDiscount = coupon.discountValue
        if (finalDiscount > subtotal) {
          finalDiscount = subtotal
        }
      }

      finalDiscount = Math.round(finalDiscount)

      // Cập nhật usedCount
      coupon.usedCount += 1
      await coupon.save({ session })

      appliedCoupon = coupon
    }

    const finalTotal = subtotal + shippingFee - finalDiscount

    // 1️⃣ Lưu đơn hàng
    const order = await Order.create(
      [
        {
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          paymentMethod,
          items,
          subtotal,
          shippingFee,
          discount: finalDiscount,
          totalPrice: finalTotal,
          voucherCode: voucherCode || null,
          couponCode: couponCode || null // ⭐ LƯU COUPON CODE
        }
      ],
      { session }
    )

    // 2️⃣ Đánh dấu Voucher đã dùng
    if (appliedVoucher) {
      appliedVoucher.status = 'used'
      appliedVoucher.usedAt = new Date()
      appliedVoucher.usedInOrderId = order[0]._id
      await appliedVoucher.save({ session })
    }

    // 3️⃣ Lưu lịch sử Coupon (MỚI)
    if (appliedCoupon && customer) {
      await CouponUsage.create(
        [
          {
            coupon: appliedCoupon._id,
            customer: customer._id,
            order: order[0]._id,
            discountAmount: finalDiscount
          }
        ],
        { session }
      )
    }

    // 4️⃣ Cập nhật thống kê khách hàng
    if (customerEmail) {
      try {
        await updateCustomerStats(customerEmail)
      } catch (e) {
        console.log('Update stats error:', e)
      }
    }

    // 5️⃣ Bắn thông báo Admin
    try {
      const notification = await Notification.create({
        title: 'Đơn hàng mới',
        message: `${customerName} vừa đặt đơn trị giá ${formatCurrency(
          finalTotal
        )}₫`,
        type: 'order',
        orderId: order[0]._id
      })

      io.emit('notification:new', {
        _id: String(notification._id),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      })
    } catch (e) {
      console.log('Notification error:', e)
    }

    // ⭐ COMMIT TRANSACTION
    await session.commitTransaction()

    return res.json(order[0])
  } catch (err) {
    await session.abortTransaction()
    console.error('❌ [POST /orders] ERROR:', err)
    return res.status(500).json({ error: 'Không thể tạo đơn hàng' })
  } finally {
    session.endSession()
  }
})

// ==================================================
// 4. GET ORDER BY ID (GIỮ NGUYÊN)
// ==================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order)
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' })
    return res.json(order)
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

// ==================================================
// 5. TRACK ORDER (GIỮ NGUYÊN)
// ==================================================
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { email, orderNumber } = req.body
    if (!email || !orderNumber)
      return res.status(400).json({ error: 'Thiếu thông tin' })

    const order = await Order.findOne({
      customerEmail: email.toLowerCase(),
      orderNumber
    })

    if (!order)
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' })
    return res.json(order)
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router

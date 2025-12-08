import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import Order from '../../models/Order'
import Notification from '../../models/Notification'
import UserReward from '../../models/UserReward'
import Customer from '../../models/Customer'
import Coupon from '../../models/Coupon'
import CouponUsage from '../../models/CouponUsage'
import Product from '../../models/Product'
import { io } from '../../index'
import { updateCustomerStats } from '../../utils/updateCustomerStats'
import { calculatePointsFromOrder } from '../../utils/loyaltyUtils'

const router = express.Router()

// Helper format tiền
function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN')
}

type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

// ==================================================
// 1. VALIDATE VOUCHER
// ==================================================
router.post('/validate-voucher', async (req: Request, res: Response) => {
  try {
    const { voucherCode, subtotal, customerEmail } = req.body

    if (!voucherCode)
      return res.status(400).json({ error: 'Vui lòng nhập mã giảm giá' })

    const userReward = await UserReward.findOne({
      voucherCode: voucherCode.toUpperCase(),
      status: 'active'
    }).populate('rewardId')

    if (!userReward)
      return res
        .status(400)
        .json({ error: 'Mã giảm giá không tồn tại hoặc sai ký tự' })

    if (userReward.expiresAt && new Date() > new Date(userReward.expiresAt)) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết hạn sử dụng' })
    }

    const reward = userReward.rewardId as any

    if (customerEmail && userReward.customerId) {
      const customer = await Customer.findOne({
        email: customerEmail.toLowerCase()
      })
      if (!customer)
        return res
          .status(400)
          .json({ error: 'Vui lòng đăng nhập đúng email sở hữu mã này.' })

      if (
        userReward.customerId.toString() !== (customer as any)._id.toString()
      ) {
        return res
          .status(400)
          .json({ error: 'Mã giảm giá này không thuộc về tài khoản của bạn' })
      }
    }

    if (reward.minOrderValue && subtotal < reward.minOrderValue) {
      return res
        .status(400)
        .json({
          error: `Đơn hàng cần tối thiểu ${formatCurrency(
            reward.minOrderValue
          )}₫ để dùng mã này`
        })
    }

    let discountAmount = 0
    if (reward.type === 'discount_percentage') {
      discountAmount = Math.floor((subtotal * Number(reward.value)) / 100)
      if (reward.maxDiscountAmount)
        discountAmount = Math.min(discountAmount, reward.maxDiscountAmount)
    } else if (reward.type === 'discount_fixed') {
      discountAmount = Number(reward.value)
    }

    return res.json({
      valid: true,
      discountAmount,
      code: userReward.voucherCode,
      type: reward.type,
      reward: { name: reward.name, value: reward.value }
    })
  } catch (err: any) {
    console.error('❌ [POST /validate-voucher] ERROR:', err)
    return res.status(500).json({ error: 'Lỗi máy chủ' })
  }
})

// ==================================================
// 2. VALIDATE COUPON
// ==================================================
router.post('/validate-coupon', async (req: Request, res: Response) => {
  try {
    const { couponCode, subtotal, customerEmail } = req.body
    if (!couponCode) return res.status(400).json({ error: 'Vui lòng nhập mã' })

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() })
    if (!coupon)
      return res.status(400).json({ error: 'Mã giảm giá không tồn tại' })
    if (!coupon.isActive)
      return res.status(400).json({ error: 'Mã giảm giá đã bị vô hiệu hóa' })

    const now = new Date()
    if (now < coupon.startDate)
      return res.status(400).json({ error: 'Mã chưa có hiệu lực' })
    if (now > coupon.endDate)
      return res.status(400).json({ error: 'Mã đã hết hạn' })
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ error: 'Mã đã hết lượt sử dụng' })

    if (customerEmail) {
      const customer = await Customer.findOne({
        email: customerEmail.toLowerCase()
      })
      if (customer) {
        const usageCount = await CouponUsage.countDocuments({
          coupon: coupon._id,
          customer: customer._id
        })
        if (
          coupon.usageLimitPerUser &&
          usageCount >= coupon.usageLimitPerUser
        ) {
          return res.status(400).json({ error: 'Bạn đã hết lượt dùng mã này' })
        }
      }
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return res
        .status(400)
        .json({
          error: `Đơn tối thiểu ${formatCurrency(coupon.minOrderAmount)}₫`
        })
    }

    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = Math.floor((subtotal * coupon.discountValue) / 100)
      if (coupon.maxDiscountAmount)
        discount = Math.min(discount, coupon.maxDiscountAmount)
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue
      if (discount > subtotal) discount = subtotal
    }

    return res.json({
      valid: true,
      discountAmount: Math.round(discount),
      code: coupon.code,
      type: coupon.discountType,
      coupon: { description: coupon.description, value: coupon.discountValue }
    })
  } catch (err: any) {
    console.error('❌ [POST /validate-coupon] ERROR:', err)
    return res.status(500).json({ error: 'Lỗi máy chủ' })
  }
})

// ==================================================
// 3. PREVIEW ORDER
// ==================================================
router.post('/preview', async (req: Request, res: Response) => {
  try {
    const { items, customerEmail, voucherCode, couponCode } = req.body
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    let discount = 0
    let shippingFee = 30000
    let pointsWillEarn = 0
    let tier: LoyaltyTier = 'bronze'
    let voucherInfo = null
    let couponInfo = null

    if (customerEmail) {
      const customer = await Customer.findOne({
        email: customerEmail.toLowerCase()
      })
      if (customer) {
        tier = (customer.loyaltyTier as LoyaltyTier) || 'bronze'
        pointsWillEarn = calculatePointsFromOrder(subtotal, tier)
      }
    }

    return res.json({
      subtotal,
      shippingFee,
      discount,
      total: subtotal + shippingFee - discount,
      pointsWillEarn,
      tier,
      message: pointsWillEarn > 0 ? `Nhận ${pointsWillEarn} điểm` : ''
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error' })
  }
})

// ==================================================
// 4. CREATE ORDER (FIXED: MAP productId)
// ==================================================
router.post('/', async (req: Request, res: Response) => {
  const session = await mongoose.startSession()
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
      couponCode,
      discount = 0
    } = req.body

    console.log('📦 [DEBUG] Items received:', JSON.stringify(items, null, 2))

    // --- 🚨 BƯỚC 1: KIỂM TRA TỒN KHO ---
    for (const item of items) {
      // 🔥 FIX QUAN TRỌNG: Thêm item.productId vào danh sách kiểm tra
      const productId = item.productId || item.product || item._id || item.id

      if (!productId) {
        throw new Error(`Item "${item.name}" bị thiếu ID sản phẩm!`)
      }

      const product = await Product.findById(productId).session(session)

      if (!product) {
        throw new Error(
          `Sản phẩm "${item.name}" (ID: ${productId}) không tồn tại.`
        )
      }

      // Check variant stock
      if (item.variantId) {
        const variant = product.variants?.find(
          (v: any) => v._id.toString() === item.variantId
        )
        if (!variant) {
          throw new Error(`Phân loại hàng của "${item.name}" không tồn tại`)
        }
        if (variant.stock < item.quantity) {
          throw new Error(
            `Phân loại "${variant.sku}" của "${item.name}" không đủ hàng (Còn: ${variant.stock})`
          )
        }
      } else {
        // Check main stock
        if ((product.stock || 0) < item.quantity) {
          throw new Error(
            `Sản phẩm "${item.name}" không đủ hàng (Còn: ${product.stock})`
          )
        }
      }
    }

    let appliedVoucher = null
    let appliedCoupon = null
    let finalDiscount = discount
    let customer = null

    if (customerEmail) {
      customer = await Customer.findOne({
        email: customerEmail.toLowerCase()
      }).session(session)
    }

    // --- XỬ LÝ VOUCHER & COUPON (Rút gọn) ---
    // ... Logic giữ nguyên ...

    const finalTotal = subtotal + shippingFee - finalDiscount

    // --- 🚨 BƯỚC 2: TẠO ĐƠN HÀNG ---
    const orderItems = items.map((item: any) => ({
      ...item,
      // 🔥 FIX QUAN TRỌNG: Map productId vào product để lưu DB đúng
      product: item.productId || item.product || item._id || item.id
    }))

    const order = await Order.create(
      [
        {
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          paymentMethod,
          items: orderItems,
          subtotal,
          shippingFee,
          discount: finalDiscount,
          totalPrice: finalTotal,
          voucherCode: voucherCode || null,
          couponCode: couponCode || null
        }
      ],
      { session }
    )

    // --- 🚨 BƯỚC 3: TRỪ TỒN KHO NGAY LẬP TỨC ---
    for (const item of orderItems) {
      if (item.variantId) {
        // Trừ stock variant & stock tổng
        await Product.updateOne(
          { _id: item.product, 'variants._id': item.variantId },
          {
            $inc: { 'variants.$.stock': -item.quantity, stock: -item.quantity }
          },
          { session }
        )
      } else {
        // Trừ stock thường
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { session }
        )
      }
    }

    // --- CÁC BƯỚC PHỤ ---
    if (customerEmail) {
      updateCustomerStats(customerEmail).catch((e) =>
        console.log('Stats error:', e)
      )
    }

    try {
      const notification = await Notification.create(
        [
          {
            title: 'Đơn hàng mới',
            message: `${customerName} đặt đơn ${formatCurrency(finalTotal)}₫`,
            type: 'order',
            orderId: order[0]._id
          }
        ],
        { session }
      )
    } catch (e) {
      console.log('Notif error:', e)
    }

    await session.commitTransaction()

    io.emit('notification:new', {
      title: 'Đơn hàng mới',
      message: `${customerName} đặt đơn ${formatCurrency(finalTotal)}₫`,
      type: 'order'
    })

    return res.json(order[0])
  } catch (err: any) {
    await session.abortTransaction()
    console.error('❌ [POST /orders] ERROR:', err.message)
    return res.status(400).json({ error: err.message || 'Lỗi tạo đơn hàng' })
  } finally {
    session.endSession()
  }
})

// ==================================================
// 5. GET MY ORDERS, GET BY ID, TRACK
// ==================================================
router.get('/my-orders', async (req: Request, res: Response) => {
  try {
    const { customerEmail } = req.query
    if (!customerEmail) return res.status(400).json({ error: 'Thiếu email' })
    const orders = await Order.find({
      customerEmail: (customerEmail as string).toLowerCase()
    })
      .sort({ createdAt: -1 })
      .lean()
    return res.json({ orders, total: orders.length })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Không tìm thấy' })
    return res.json(order)
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

router.post('/track', async (req: Request, res: Response) => {
  try {
    const { email, orderNumber } = req.body
    const order = await Order.findOne({
      customerEmail: email.toLowerCase(),
      orderNumber
    })
    if (!order) return res.status(404).json({ error: 'Không tìm thấy' })
    return res.json(order)
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router

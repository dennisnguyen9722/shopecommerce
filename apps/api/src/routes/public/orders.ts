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
import { protect } from '../../middleware/auth'

const router = express.Router()

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
      return res.status(400).json({
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
      return res.status(400).json({
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
    const { items, customerEmail } = req.body
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    let shippingFee = 30000
    let pointsWillEarn = 0
    let tier: LoyaltyTier = 'bronze'

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
      discount: 0,
      total: subtotal + shippingFee,
      pointsWillEarn,
      tier,
      message: pointsWillEarn > 0 ? `Nhận ${pointsWillEarn} điểm` : ''
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error' })
  }
})

// ==================================================
// 4. ⭐ CREATE ORDER - FIXED VARIANT STOCK
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

    console.log('📦 [CREATE ORDER] Bắt đầu tạo đơn hàng')
    console.log('📦 Items nhận được:', JSON.stringify(items, null, 2))

    // --- 🔥 BƯỚC 1: VALIDATE & CHECK STOCK ---
    for (const item of items) {
      const productId = item.productId || item.product || item._id

      if (!productId) {
        throw new Error(`❌ Item "${item.name}" thiếu productId`)
      }

      const product = await Product.findById(productId).session(session)

      if (!product) {
        throw new Error(`❌ Sản phẩm "${item.name}" không tồn tại`)
      }

      // ⭐ CHECK VARIANT STOCK
      if (item.variantId) {
        console.log(`🔍 Kiểm tra variant: ${item.variantId}`)

        const variant = product.variants?.find(
          (v: any) => v._id.toString() === item.variantId.toString()
        )

        if (!variant) {
          throw new Error(`❌ Biến thể của "${item.name}" không tồn tại`)
        }

        console.log(
          `📊 Variant stock hiện tại: ${variant.stock}, Đặt: ${item.quantity}`
        )

        if (variant.stock < item.quantity) {
          // Lấy thông tin màu/size để hiển thị lỗi rõ ràng
          const colorInfo =
            variant.options?.get('Màu sắc') ||
            variant.options?.get('Color') ||
            ''
          const sizeInfo =
            variant.options?.get('Kích thước') ||
            variant.options?.get('Size') ||
            ''
          const variantName = [colorInfo, sizeInfo].filter(Boolean).join(' - ')

          throw new Error(
            `❌ "${item.name}" ${
              variantName ? `(${variantName})` : ''
            } không đủ hàng. Còn: ${variant.stock}, Đặt: ${item.quantity}`
          )
        }
      } else {
        // CHECK MAIN STOCK
        console.log(`📊 Product stock: ${product.stock}, Đặt: ${item.quantity}`)

        if ((product.stock || 0) < item.quantity) {
          throw new Error(
            `❌ "${item.name}" không đủ hàng. Còn: ${product.stock}, Đặt: ${item.quantity}`
          )
        }
      }
    }

    console.log('✅ Stock validation passed!')

    // --- BƯỚC 2: XỬ LÝ VOUCHER & COUPON (giữ nguyên logic cũ) ---
    let customer = null
    let finalDiscount = discount

    if (customerEmail) {
      customer = await Customer.findOne({
        email: customerEmail.toLowerCase()
      }).session(session)
    }

    // Logic voucher/coupon... (giữ nguyên)

    const finalTotal = subtotal + shippingFee - finalDiscount

    // --- 🔥 BƯỚC 3: MAP ITEMS CHO ORDER ---
    const orderItems = items.map((item: any) => {
      const productId = item.productId || item.product || item._id

      const mappedItem: any = {
        product: productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        slug: item.slug
      }

      // ⭐ NẾU CÓ VARIANT - LƯU ĐẦY ĐỦ THÔNG TIN
      if (item.variantId) {
        mappedItem.variantId = item.variantId

        // Lưu thông tin variant để hiển thị sau này
        mappedItem.variantInfo = {
          sku: item.sku || item.variantSku,
          color: item.color,
          size: item.size,
          options: item.variantOptions || {}
        }
      }

      return mappedItem
    })

    console.log('📝 Order items đã map:', JSON.stringify(orderItems, null, 2))

    // --- BƯỚC 4: TẠO ORDER ---
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

    console.log('✅ Order created:', order[0]._id)

    // --- 🔥 BƯỚC 5: TRỪ STOCK ---
    for (const item of orderItems) {
      if (item.variantId) {
        // ⭐ TRỪ STOCK VARIANT
        console.log(
          `📉 Trừ stock variant: ${item.variantId} x ${item.quantity}`
        )

        const result = await Product.updateOne(
          {
            _id: item.product,
            'variants._id': item.variantId
          },
          {
            $inc: {
              'variants.$.stock': -item.quantity,
              stock: -item.quantity
            }
          },
          { session }
        )

        console.log(
          `✅ Variant stock updated: matched=${result.matchedCount}, modified=${result.modifiedCount}`
        )

        // ⭐ LẤY STOCK MỚI SAU KHI TRỪ
        const updatedProduct = await Product.findOne(
          { _id: item.product, 'variants._id': item.variantId },
          { 'variants.$': 1 }
        ).session(session)

        const newVariantStock = updatedProduct?.variants?.[0]?.stock || 0

        // ⭐ EMIT REAL-TIME EVENT
        io.emit('product:stock-updated', {
          productId: item.product.toString(),
          variantId: item.variantId.toString(),
          newStock: newVariantStock,
          type: 'variant'
        })

        console.log(
          `📡 Emitted stock update: variant ${item.variantId} → ${newVariantStock}`
        )
      } else {
        // TRỪ STOCK THƯỜNG
        console.log(`📉 Trừ stock thường: ${item.product} x ${item.quantity}`)

        const updatedProduct = await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { session, new: true }
        )

        console.log('✅ Product stock updated')

        // ⭐ EMIT REAL-TIME EVENT
        if (updatedProduct) {
          io.emit('product:stock-updated', {
            productId: item.product.toString(),
            variantId: null,
            newStock: updatedProduct.stock,
            type: 'product'
          })

          console.log(
            `📡 Emitted stock update: product ${item.product} → ${updatedProduct.stock}`
          )
        }
      }
    }

    // --- BƯỚC 6: CÁC XỬ LÝ PHỤ ---
    if (customerEmail) {
      updateCustomerStats(customerEmail).catch((e) =>
        console.log('Stats update error:', e)
      )
    }

    try {
      await Notification.create(
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
      console.log('Notification error:', e)
    }

    await session.commitTransaction()
    console.log('✅ Transaction committed')

    io.emit('notification:new', {
      title: 'Đơn hàng mới',
      message: `${customerName} đặt đơn ${formatCurrency(finalTotal)}₫`,
      type: 'order'
    })

    return res.json(order[0])
  } catch (err: any) {
    await session.abortTransaction()
    console.error('❌ [CREATE ORDER] ERROR:', err.message)
    return res.status(400).json({ error: err.message || 'Lỗi tạo đơn hàng' })
  } finally {
    session.endSession()
  }
})

// ==================================================
// 5. GET MY ORDERS, GET BY ID, TRACK
// ==================================================
router.get('/', protect, async (req: any, res: Response) => {
  try {
    const userId = req.user.id

    console.log('📥 [GET /orders] User ID:', userId)

    // Lấy thông tin Customer
    const customer = await Customer.findById(userId)

    if (!customer) {
      console.error('❌ Customer not found:', userId)
      return res
        .status(404)
        .json({ error: 'Không tìm thấy thông tin khách hàng' })
    }

    console.log('✅ Customer found:', customer.email)

    // Tìm orders theo cả email VÀ customerId
    const orders = await Order.find({
      $or: [
        { customerEmail: customer.email.toLowerCase() },
        { customerId: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .lean()

    console.log(`✅ Found ${orders.length} orders`)

    return res.json(orders)
  } catch (err: any) {
    console.error('❌ [GET /orders] ERROR:', err)
    return res.status(500).json({
      error: 'Lỗi server khi lấy danh sách đơn',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
})

router.get('/:id', protect, async (req: any, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      // Chỉ cho phép xem nếu email khớp với user đang login
      customerEmail: req.user.email.toLowerCase()
    })

    if (!order)
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' })
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

import express, { Request, Response } from 'express'
import Order from '../../models/Order'
import Notification from '../../models/Notification'
import UserReward from '../../models/UserReward'
import Reward from '../../models/Reward'
import Customer from '../../models/Customer'
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
// ⭐ 1. VALIDATE VOUCHER (Đã Fix lỗi so sánh ID)
// ==================================================
router.post('/validate-voucher', async (req: Request, res: Response) => {
  console.log('🎯 HIT validate-voucher API')

  try {
    const { voucherCode, subtotal, customerEmail } = req.body

    // 1. Kiểm tra đầu vào
    if (!voucherCode) {
      return res.status(400).json({ error: 'Vui lòng nhập mã giảm giá' })
    }

    // 2. Tìm voucher trong DB
    const userReward = await UserReward.findOne({
      voucherCode: voucherCode.toUpperCase(),
      status: 'active'
    }).populate('rewardId')

    if (!userReward) {
      return res
        .status(400)
        .json({ error: 'Mã giảm giá không tồn tại hoặc sai ký tự' })
    }

    // 3. Kiểm tra hạn sử dụng
    if (userReward.expiresAt && new Date() > new Date(userReward.expiresAt)) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết hạn sử dụng' })
    }

    const reward = userReward.rewardId as any

    // 4. Kiểm tra quyền sở hữu (FIXED LOGIC)
    if (customerEmail) {
      const customer = await Customer.findOne({
        email: customerEmail.toLowerCase()
      })

      // Nếu voucher đã gán cho user ID cụ thể
      if (userReward.customerId) {
        // Nếu không tìm thấy khách hàng trong DB (khách mới chưa có account)
        if (!customer) {
          return res
            .status(400)
            .json({
              error:
                'Mã này dành riêng cho thành viên thân thiết. Vui lòng đăng nhập đúng email.'
            })
        }

        // 👇 LOG ĐỂ DEBUG: Bạn xem terminal backend hiện gì nhé
        console.log(
          `🔍 Check Owner: VoucherOwner=${userReward.customerId.toString()} | CurrentUser=${customer._id.toString()}`
        )

        // So sánh String để chắc chắn
        if (
          userReward.customerId.toString() !== (customer as any)._id.toString()
        ) {
          // Trả về 400 thay vì 403 để Frontend hiện Toast dễ hơn
          return res
            .status(400)
            .json({ error: 'Mã giảm giá này không thuộc về tài khoản của bạn' })
        }
      }
    }

    // 5. Kiểm tra giá trị đơn hàng tối thiểu
    if (reward.minOrderValue && subtotal < reward.minOrderValue) {
      return res.status(400).json({
        error: `Đơn hàng cần tối thiểu ${formatCurrency(
          reward.minOrderValue
        )}₫ để dùng mã này`
      })
    }

    // 6. Tính toán số tiền giảm
    let discountAmount = 0
    if (reward.type === 'discount_percentage') {
      discountAmount = Math.floor((subtotal * Number(reward.value)) / 100)
      if (reward.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, reward.maxDiscountAmount)
      }
    } else if (reward.type === 'discount_fixed') {
      discountAmount = Number(reward.value)
    }

    // 7. Trả kết quả thành công
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
// ⭐ 2. PREVIEW ORDER
// ==================================================
router.post('/preview', async (req: Request, res: Response) => {
  try {
    const { items, customerEmail, voucherCode } = req.body

    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity
    }, 0)

    let discount = 0
    let shippingFee = 30000
    let pointsWillEarn = 0
    let tier: LoyaltyTier = 'bronze'
    let voucherInfo = null

    if (customerEmail) {
      const customer = await Customer.findOne({
        email: customerEmail.toLowerCase()
      })

      if (customer) {
        tier = (customer.loyaltyTier as LoyaltyTier) || 'bronze'
        pointsWillEarn = calculatePointsFromOrder(subtotal, tier)
      }
    }

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

    const total = subtotal + shippingFee - discount

    return res.json({
      subtotal,
      shippingFee,
      discount,
      total,
      pointsWillEarn,
      tier,
      voucherInfo,
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
// ⭐ 3. CREATE ORDER
// ==================================================
router.post('/', async (req: Request, res: Response) => {
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
      discount = 0
    } = req.body

    let appliedVoucher = null
    let finalDiscount = discount

    // --- Validate lại Voucher trước khi tạo đơn ---
    if (voucherCode) {
      const userReward = await UserReward.findOne({
        voucherCode: voucherCode.toUpperCase(),
        status: 'active'
      }).populate('rewardId')

      const isExpired =
        userReward?.expiresAt && new Date() > new Date(userReward.expiresAt)

      if (!userReward || isExpired) {
        return res
          .status(400)
          .json({ error: 'Mã voucher không hợp lệ hoặc đã hết hạn' })
      }

      const reward = userReward.rewardId as any

      // Check quyền sở hữu (Lặp lại logic ở trên)
      if (customerEmail && userReward.customerId) {
        const customer = await Customer.findOne({
          email: customerEmail.toLowerCase()
        })
        if (
          customer &&
          userReward.customerId.toString() !== (customer as any)._id.toString()
        ) {
          return res.status(400).json({ error: 'Voucher không thuộc về bạn' })
        }
      }

      // TÍNH LẠI DISCOUNT
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

    const finalTotal = subtotal + shippingFee - finalDiscount

    // 1️⃣ Lưu đơn hàng
    const order = await Order.create({
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
      voucherCode: voucherCode || null
    })

    // 2️⃣ Đánh dấu Voucher đã sử dụng
    if (appliedVoucher) {
      appliedVoucher.status = 'used'
      appliedVoucher.usedAt = new Date()
      appliedVoucher.usedInOrderId = order._id
      await appliedVoucher.save()
    }

    // 3️⃣ Cập nhật thống kê khách hàng
    if (customerEmail) {
      try {
        await updateCustomerStats(customerEmail)
      } catch (e) {}
    }

    // 4️⃣ Bắn thông báo Admin
    try {
      const notification = await Notification.create({
        title: 'Đơn hàng mới',
        message: `${customerName} vừa đặt đơn trị giá ${formatCurrency(
          finalTotal
        )}₫`,
        type: 'order',
        orderId: order._id
      })

      io.emit('notification:new', {
        _id: String(notification._id),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      })
    } catch (e) {}

    return res.json(order)
  } catch (err) {
    console.error('❌ [POST /orders] ERROR:', err)
    return res.status(500).json({ error: 'Không thể tạo đơn hàng' })
  }
})

// ==================================================
// 4. GET ORDER BY ID
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
// 5. TRACK ORDER
// ==================================================
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { email, orderNumber } = req.body
    if (!email || !orderNumber)
      return res.status(400).json({ error: 'Thiếu thông tin' })

    const order = await Order.findOne({
      customerEmail: email.toLowerCase(),
      orderNumber // Nếu DB bạn dùng field _id thì sửa lại thành _id: orderNumber
    })

    if (!order)
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' })
    return res.json(order)
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router

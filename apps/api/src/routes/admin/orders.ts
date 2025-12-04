// routes/admin/orders.ts
import express, { Request, Response } from 'express'
import Order from '../../models/Order'
import Notification from '../../models/Notification'
import { io } from '../../index'
import { updateCustomerStats } from '../../utils/updateCustomerStats'
import {
  awardPointsForOrder,
  refundPointsForOrder
} from '../../utils/orderPointsHook'
import { sendInvoiceEmail } from '../../services/emailService' // ✅ THÊM IMPORT NÀY

const router = express.Router()

function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN')
}

// ======================
// CREATE ORDER (ADMIN)
// ======================
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      paymentMethod,
      items,
      totalPrice
    } = req.body

    const order = await Order.create({
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      paymentMethod,
      items,
      totalPrice
    })

    // 🆕 Auto update customer stats
    if (customerEmail) {
      try {
        await updateCustomerStats(customerEmail)
      } catch (cusErr) {
        console.error('❌ Error updating customer stats:', cusErr)
      }
    }

    // 📢 Notification
    try {
      const notification = await Notification.create({
        title: 'Đơn hàng mới',
        message: `${customerName} vừa đặt đơn hàng ${formatCurrency(
          totalPrice
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
    } catch (notifErr) {
      console.error('❌ Error creating notification:', notifErr)
    }

    res.json(order)
  } catch (err) {
    console.error('❌ [POST /admin/orders] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================
// GET ALL ORDERS
// ======================
router.get('/', async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    console.error('❌ [GET /admin/orders] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================
// GET ORDER BY ID
// ======================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) return res.status(404).json({ error: 'Order not found' })

    res.json(order)
  } catch (err) {
    console.error('❌ [GET /admin/orders/:id] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================
// UPDATE ORDER STATUS (⭐ TÍCH HỢP LOYALTY + EMAIL)
// ======================
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    console.log('🔍 Order TRƯỚC khi update:', {
      id: order._id,
      status: order.status,
      customerEmail: order.customerEmail,
      hasItems: !!order.items,
      itemsCount: order.items?.length
    })

    const oldStatus = order.status

    // Update status
    order.status = status
    await order.save()

    console.log('✅ Order ĐÃ update status:', {
      id: order._id,
      newStatus: status,
      oldStatus: oldStatus
    })

    // ⭐ LOYALTY: Tích điểm khi order hoàn thành
    if (
      (status === 'completed' || status === 'delivered') &&
      oldStatus !== 'completed' &&
      oldStatus !== 'delivered'
    ) {
      console.log('💰 Bắt đầu xử lý loyalty + email...')

      if (order.customerEmail) {
        // Tích điểm
        try {
          await awardPointsForOrder(
            order._id.toString(),
            order.customerEmail,
            order.totalPrice
          )
          console.log(`✅ Awarded points for order ${order._id}`)
        } catch (pointsErr) {
          console.error('❌ Error awarding points:', pointsErr)
        }

        // ✅ GỬI EMAIL - QUAN TRỌNG: Convert sang plain object
        console.log('📧 Bắt đầu gửi email...')
        console.log('📧 Order data trước khi gửi:', {
          _id: order._id,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          totalPrice: order.totalPrice,
          itemsCount: order.items?.length
        })

        try {
          // ✅ QUAN TRỌNG: Convert Mongoose document sang plain object
          const orderData = order.toObject()

          console.log('📧 Calling sendInvoiceEmail...')
          await sendInvoiceEmail(orderData)

          console.log(
            `📧 ✅ Email hóa đơn đã gửi thành công đến: ${order.customerEmail}`
          )
        } catch (emailErr: any) {
          console.error('⚠️ CHI TIẾT LỖI EMAIL:', {
            message: emailErr.message,
            stack: emailErr.stack,
            name: emailErr.name
          })
        }
      } else {
        console.log('⚠️ Order không có customerEmail!')
      }
    }

    // ⭐ LOYALTY: Hoàn điểm khi order bị hủy
    if (
      (status === 'cancelled' || status === 'refunded') &&
      (oldStatus === 'completed' || oldStatus === 'delivered')
    ) {
      if (order.customerEmail) {
        try {
          await refundPointsForOrder(
            order._id.toString(),
            order.customerEmail,
            order.totalPrice
          )
          console.log(`♻️ Refunded points for order ${order._id}`)
        } catch (pointsErr) {
          console.error('❌ Error refunding points:', pointsErr)
        }
      }
    }

    // 🆕 Auto update customer stats khi completed hoặc cancelled
    if (order.customerEmail && ['completed', 'cancelled'].includes(status)) {
      try {
        await updateCustomerStats(order.customerEmail)
      } catch (cusErr) {
        console.error('❌ Error updating customer stats:', cusErr)
      }
    }

    res.json(order)
  } catch (err) {
    console.error('❌ [PUT /admin/orders/:id/status] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================
// UPDATE ORDER
// ======================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    })

    if (!order) return res.status(404).json({ error: 'Order not found' })

    res.json(order)
  } catch (err) {
    console.error('❌ [PUT /admin/orders/:id] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================
// DELETE ORDER
// ======================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)

    if (!order) return res.status(404).json({ error: 'Order not found' })

    // Update customer stats sau khi xóa
    if (order.customerEmail) {
      try {
        await updateCustomerStats(order.customerEmail)
      } catch (cusErr) {
        console.error('❌ Error updating customer stats:', cusErr)
      }
    }

    res.json({ message: 'Order deleted' })
  } catch (err) {
    console.error('❌ [DELETE /admin/orders/:id] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

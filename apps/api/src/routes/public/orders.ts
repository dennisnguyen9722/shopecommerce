import express, { Request, Response } from 'express'
import Order from '../../models/Order'
import Notification from '../../models/Notification'
import Customer from '../../models/Customer'
import { io } from '../../index'

const router = express.Router()

// Helper function
function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN')
}

// ======================
// CREATE ORDER (PUBLIC)
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

    // 1️⃣ Tạo đơn hàng
    const order = await Order.create({
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      paymentMethod,
      items,
      totalPrice
    })

    // 2️⃣ Tự động tạo / cập nhật khách hàng
    try {
      await Customer.findOneAndUpdate(
        { email: customerEmail }, // Ưu tiên định danh email
        {
          $setOnInsert: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            status: 'active',
            tags: []
          },
          $set: {
            lastOrderDate: new Date()
          },
          $inc: {
            ordersCount: 1,
            totalSpent: totalPrice
          }
        },
        { upsert: true, new: true }
      )
    } catch (cusErr) {
      console.error('❌ Error updating customer:', cusErr)
    }

    // 3️⃣ Tạo Notification
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

    return res.json(order)
  } catch (err) {
    console.error('❌ [POST /public/orders] ERROR:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// ======================
// GET ORDER BY ID
// ======================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) return res.status(404).json({ error: 'Order not found' })

    return res.json(order)
  } catch (err) {
    console.error('❌ [GET /public/orders/:id] ERROR:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router

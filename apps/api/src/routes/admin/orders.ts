import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import Order from '../../models/Order'
import Product from '../../models/Product'
import Notification from '../../models/Notification'
import { io } from '../../index'
import { updateCustomerStats } from '../../utils/updateCustomerStats'
import {
  awardPointsForOrder,
  refundPointsForOrder
} from '../../utils/orderPointsHook'
import { sendInvoiceEmail } from '../../services/emailService'

const router = express.Router()

function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN')
}

// Hàm hỗ trợ Log (để console đỡ rối)
const log = (msg: string) => console.log(`[ORDER-ADMIN] ${msg}`)

// =====================================================================
// 🔥 HÀM XỬ LÝ HOÀN KHO (Tách ra để dùng chung cho cả 2 API)
// =====================================================================
async function handleRestockLogic(order: any) {
  log(`📦 BẮT ĐẦU HOÀN KHO cho đơn: ${order._id}`)

  for (const item of order.items) {
    const rawItem = item as any
    let rawId =
      rawItem.product || rawItem.productId || rawItem._id || rawItem.id

    if (rawId && typeof rawId === 'object' && rawId._id) {
      rawId = rawId._id
    }

    if (!rawId) {
      console.error(
        `   ❌ LỖI: Item "${item.name}" không tìm thấy ID sản phẩm!`
      )
      continue
    }

    try {
      const productId = new mongoose.Types.ObjectId(String(rawId))

      if (item.variantId) {
        // ⭐ HOÀN KHO BIẾN THỂ
        const variantId = new mongoose.Types.ObjectId(String(item.variantId))
        const res = await Product.updateOne(
          { _id: productId, 'variants._id': variantId },
          {
            $inc: {
              'variants.$.stock': item.quantity,
              stock: item.quantity
            }
          }
        )
        log(
          `   🔄 Hoàn kho Biến thể (${item.name}): Matched=${res.matchedCount}, Mod=${res.modifiedCount}`
        )

        // ⭐ LẤY STOCK MỚI SAU KHI HOÀN
        const updatedProduct = await Product.findOne(
          { _id: productId, 'variants._id': variantId },
          { 'variants.$': 1 }
        )

        const newVariantStock = updatedProduct?.variants?.[0]?.stock || 0

        // ⭐ EMIT REAL-TIME EVENT
        io.emit('product:stock-updated', {
          productId: productId.toString(),
          variantId: variantId.toString(),
          newStock: newVariantStock,
          type: 'variant'
        })

        log(`   📡 Emitted restock: variant ${variantId} → ${newVariantStock}`)
      } else {
        // ⭐ HOÀN KHO SẢN PHẨM THƯỜNG
        const res = await Product.findByIdAndUpdate(
          productId,
          { $inc: { stock: item.quantity } },
          { new: true }
        )
        log(`   🔄 Hoàn kho Thường (${item.name}): ${res ? 'OK' : 'Fail'}`)

        // ⭐ EMIT REAL-TIME EVENT
        if (res) {
          io.emit('product:stock-updated', {
            productId: productId.toString(),
            variantId: null,
            newStock: res.stock,
            type: 'product'
          })

          log(`   📡 Emitted restock: product ${productId} → ${res.stock}`)
        }
      }
    } catch (e: any) {
      console.error(`   ❌ Lỗi hoàn kho item ${item.name}:`, e.message)
    }
  }
  log('✅ KẾT THÚC HOÀN KHO')
}

// ======================
// CREATE ORDER
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

    if (customerEmail) updateCustomerStats(customerEmail).catch(console.error)

    try {
      const notification = await Notification.create({
        title: 'Đơn hàng mới (Admin)',
        message: `${customerName} lên đơn ${formatCurrency(totalPrice)}`,
        type: 'order',
        orderId: order._id
      })
      io.emit('notification:new', notification)
    } catch (e) {}

    res.json(order)
  } catch (err) {
    console.error('❌ POST /admin/orders:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================
// GET ALL
// ======================
router.get('/', async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================
// GET ONE
// ======================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================
// ✅ UPDATE STATUS (API RIÊNG) - FIXED
// ======================
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body

    // ✅ FIX: Lấy đơn hàng CŨ trước khi update (để có đầy đủ items cho hoàn kho)
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    const oldStatus = order.status.toLowerCase().trim()
    const newStatus = status.toLowerCase().trim()

    // Nếu trạng thái không đổi, return luôn
    if (newStatus === oldStatus) return res.json(order)

    // CHECK HOÀN KHO
    const cancelStatuses = [
      'cancelled',
      'refunded',
      'returned',
      'đã hủy',
      'hủy'
    ]

    if (
      cancelStatuses.includes(newStatus) &&
      !cancelStatuses.includes(oldStatus)
    ) {
      log(`🚨 Phát hiện HỦY ĐỠN từ API /status - Bắt đầu hoàn kho`)
      // ✅ Dùng order hiện tại (có đầy đủ items)
      await handleRestockLogic(order)
    }

    // Update trạng thái
    order.status = status
    await order.save()

    // Xử lý Loyalty/Email
    handlePostUpdateActions(order, newStatus, oldStatus)

    res.json(order)
  } catch (err) {
    console.error('❌ PUT /admin/orders/:id/status:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================
// ✅ UPDATE GENERAL (API CHUNG) - FIXED
// ======================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // 1. Lấy đơn cũ trước khi update (để có items cho hoàn kho)
    const oldOrder = await Order.findById(req.params.id)
    if (!oldOrder) return res.status(404).json({ error: 'Order not found' })

    const oldStatus = oldOrder.status.toLowerCase().trim()

    // 2. Update dữ liệu mới
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!updatedOrder) return res.status(404).json({ error: 'Update failed' })

    const newStatus = updatedOrder.status.toLowerCase().trim()

    // 3. CHECK HOÀN KHO
    const cancelStatuses = [
      'cancelled',
      'refunded',
      'returned',
      'đã hủy',
      'hủy'
    ]

    // Nếu trạng thái MỚI là hủy, và trạng thái CŨ chưa hủy => Hoàn kho
    if (
      cancelStatuses.includes(newStatus) &&
      !cancelStatuses.includes(oldStatus)
    ) {
      log(`🚨 Phát hiện HỦY ĐƠN từ API Update Chung - Bắt đầu hoàn kho`)
      // ✅ FIX: Dùng oldOrder (có đầy đủ items) thay vì updatedOrder
      await handleRestockLogic(oldOrder)
    }

    // 4. Xử lý Loyalty/Email
    handlePostUpdateActions(updatedOrder, newStatus, oldStatus)

    res.json(updatedOrder)
  } catch (err) {
    console.error('❌ PUT /admin/orders/:id:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================
// DELETE
// ======================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (order.customerEmail)
      updateCustomerStats(order.customerEmail).catch(console.error)
    res.json({ message: 'Order deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// --- Helper Functions ---

async function handlePostUpdateActions(
  order: any,
  newStatus: string,
  oldStatus: string
) {
  const completeStatuses = ['completed', 'delivered', 'hoàn thành', 'đã giao']
  const cancelStatuses = ['cancelled', 'refunded', 'returned', 'đã hủy', 'hủy']

  if (order.customerEmail) {
    // Tích điểm
    if (
      completeStatuses.includes(newStatus) &&
      !completeStatuses.includes(oldStatus)
    ) {
      awardPointsForOrder(
        order._id.toString(),
        order.customerEmail,
        order.totalPrice
      ).catch(console.error)
      try {
        await sendInvoiceEmail(order.toObject())
      } catch (e) {
        console.error(e)
      }
    }
    // Trừ điểm
    if (
      cancelStatuses.includes(newStatus) &&
      completeStatuses.includes(oldStatus)
    ) {
      refundPointsForOrder(
        order._id.toString(),
        order.customerEmail,
        order.totalPrice
      ).catch(console.error)
    }
    // Update stats
    updateCustomerStats(order.customerEmail).catch(console.error)
  }
}

export default router

import express from 'express'
import Notification from '../models/Notification'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'
import { io } from '../index'

const router = express.Router()

// ⭐ Quyền cần để quản lý thông báo
const CAN_MANAGE = requirePermissions('manage_notifications')

// ⭐ Bắt buộc login + có quyền
router.use(protect, CAN_MANAGE)

/* ============================================================
   GET /admin/notifications
   → Lấy tất cả thông báo
============================================================ */
router.get('/', async (_req, res) => {
  try {
    const items = await Notification.find().sort({ createdAt: -1 }).lean()
    res.json(items)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   GET /admin/notifications/unread-count
============================================================ */
router.get('/unread-count', async (_req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false })
    res.json({ unread: count })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   POST /admin/notifications
   → Tạo thông báo mới
============================================================ */
router.post('/', async (req, res) => {
  try {
    const notif = await Notification.create({
      title: req.body.title,
      message: req.body.message,
      type: req.body.type || 'info',
      read: false
    })

    // Emit realtime
    io.emit('notification:new', notif)

    res.json(notif)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   PUT /admin/notifications/:id/read
   → Đánh dấu đã đọc
============================================================ */
router.put('/:id/read', async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    )

    io.emit('notification:update')

    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/* ============================================================
   PUT /admin/notifications/read-all
   → Đánh dấu tất cả đã đọc
============================================================ */
router.put('/read-all', async (_req, res) => {
  try {
    await Notification.updateMany({}, { read: true })

    io.emit('notification:update')

    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router

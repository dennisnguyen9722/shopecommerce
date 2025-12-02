import express from 'express'
import Notification from '../models/Notification'

const router = express.Router()

// GET ALL NOTIFICATIONS
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    res.json(notifications) // ✅ Trả về array trực tiếp
  } catch (err) {
    console.error('❌ [GET /admin/notifications] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET UNREAD COUNT
router.get('/unread-count', async (req, res) => {
  try {
    const unread = await Notification.countDocuments({ isRead: false })

    res.json({ unread })
  } catch (err) {
    console.error('❌ [GET /admin/notifications/unread-count] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// MARK AS READ
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    res.json({ success: true, notification })
  } catch (err) {
    console.error('❌ [PUT /admin/notifications/:id/read] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// MARK ALL AS READ
router.put('/read-all', async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { isRead: false },
      { isRead: true }
    )

    res.json({
      success: true,
      modified: result.modifiedCount
    })
  } catch (err) {
    console.error('❌ [PUT /admin/notifications/read-all] ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

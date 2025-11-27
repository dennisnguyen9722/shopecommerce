// apps/api/src/routes/profile.ts
import express from 'express'
import multer from 'multer'
import User from '../models/User'
import { protect } from '../middleware/auth'
import { uploadStream } from '../utils/cloudinary'
import bcrypt from 'bcryptjs'

const router = express.Router()

// ===============================
// GET PROFILE
// ===============================
router.get('/', protect, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===============================
// UPDATE PROFILE (name, avatar, address,...)
// ===============================
router.put('/', protect, async (req: any, res) => {
  try {
    const { name, address, avatar } = req.body

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, address, avatar },
      { new: true }
    ).select('-password')

    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===============================
// UPLOAD AVATAR
// ===============================
const upload = multer({ storage: multer.memoryStorage() })

router.post(
  '/avatar',
  protect,
  upload.single('file'),
  async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

      const uploaded = await uploadStream(req.file.buffer, 'avatars')

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: uploaded.url },
        { new: true }
      ).select('-password')

      res.json(user)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  }
)

// ===============================
// CHANGE PASSWORD
// ===============================
router.put('/change-password', protect, async (req: any, res) => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Thiếu dữ liệu' })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User không tồn tại' })

    const isMatch = await user.matchPassword(oldPassword)
    if (!isMatch) {
      return res.status(400).json({ error: 'Mật khẩu cũ không đúng' })
    }

    user.password = newPassword
    await user.save()

    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router

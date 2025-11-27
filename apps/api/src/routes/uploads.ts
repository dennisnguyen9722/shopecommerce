import express from 'express'
import multer from 'multer'
import { uploadStream } from '../utils/cloudinary'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'

const router = express.Router()

// ⭐ Quyền để upload QR (thuộc Payment settings)
const CAN_UPLOAD_QR = requirePermissions('manage_payment')

router.use(protect, CAN_UPLOAD_QR)

// Dùng lại memoryStorage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

// ----------------------------------------
// UPLOAD QR CODE FOR PAYMENT METHODS
// POST /uploads/qr
// ----------------------------------------
router.post('/qr', upload.single('file'), async (req, res) => {
  try {
    const file = req.file as Express.Multer.File

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const uploaded = await uploadStream(file.buffer, 'ecommerce/payment/qr')

    res.json({
      url: uploaded.url,
      publicId: uploaded.public_id
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router

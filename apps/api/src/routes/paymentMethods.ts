import express from 'express'
import PaymentMethod from '../models/PaymentMethod'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'

const router = express.Router()

// ⭐ Chỉ cần login + có quyền manage_payment
const CAN_MANAGE = requirePermissions('manage_payment')

// ---------------------------
// REORDER
// ---------------------------
router.put('/reorder', protect, CAN_MANAGE, async (req, res) => {
  const { orderedKeys } = req.body

  if (!Array.isArray(orderedKeys)) {
    return res.status(400).json({ error: 'orderedKeys must be an array' })
  }

  for (let i = 0; i < orderedKeys.length; i++) {
    await PaymentMethod.findOneAndUpdate(
      { key: orderedKeys[i] },
      { sortOrder: i }
    )
  }

  res.json({ ok: true })
})

// ---------------------------
// GET ALL
// ---------------------------
router.get('/', protect, CAN_MANAGE, async (_req, res) => {
  const list = await PaymentMethod.find().sort({ sortOrder: 1 })
  res.json(list)
})

const DEFAULT_BANK_CONFIG = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  branch: '',
  instructions: '',
  qrCodeUrl: ''
}

const DEFAULT_MOMO_CONFIG = {
  phone: '',
  accountName: '',
  qrCodeUrl: '',
  instructions: ''
}

// ---------------------------
// UPDATE
// ---------------------------
router.put('/:key', protect, CAN_MANAGE, async (req, res) => {
  const { key } = req.params
  let updates = req.body

  if (key === 'bank') {
    updates.config = {
      ...DEFAULT_BANK_CONFIG,
      ...(updates.config || {})
    }
  }

  if (key === 'momo') {
    updates.config = {
      ...DEFAULT_MOMO_CONFIG,
      ...(updates.config || {})
    }
  }

  const updated = await PaymentMethod.findOneAndUpdate({ key }, updates, {
    new: true
  })

  if (!updated) return res.status(404).json({ error: 'Not found' })

  res.json(updated)
})

// ---------------------------
// TOGGLE
// ---------------------------
router.patch('/:key/toggle', protect, CAN_MANAGE, async (req, res) => {
  const method = await PaymentMethod.findOne({ key: req.params.key })
  if (!method) return res.status(404).json({ error: 'Not found' })

  method.enabled = !method.enabled
  await method.save()

  res.json(method)
})

export default router

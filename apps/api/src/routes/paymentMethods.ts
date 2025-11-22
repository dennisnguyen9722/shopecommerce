import express from 'express'
import PaymentMethod from '../models/PaymentMethod'
import { protect, adminOnly } from '../middleware/auth'

const router = express.Router()

router.use(protect, adminOnly)

// GET all
router.get('/', async (_req, res) => {
  const list = await PaymentMethod.find().sort({ sortOrder: 1 })
  res.json(list)
})

// UPDATE config + enabled
router.put('/:key', async (req, res) => {
  const updated = await PaymentMethod.findOneAndUpdate(
    { key: req.params.key },
    req.body,
    { new: true }
  )

  if (!updated) return res.status(404).json({ error: 'Not found' })

  res.json(updated)
})

// TOGGLE enabled
router.patch('/:key/toggle', async (req, res) => {
  const method = await PaymentMethod.findOne({ key: req.params.key })
  if (!method) return res.status(404).json({ error: 'Not found' })

  method.enabled = !method.enabled
  await method.save()

  res.json(method)
})

export default router

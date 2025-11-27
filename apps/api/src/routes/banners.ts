import express from 'express'
import Banner from '../models/Banner'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'

const router = express.Router()

const CAN_MANAGE = requirePermissions('manage_banners')

router.get('/', protect, CAN_MANAGE, async (_req, res) => {
  const banners = await Banner.find().sort({ position: 1, order: 1 })
  res.json(banners)
})

router.post('/', protect, CAN_MANAGE, async (req, res) => {
  const banner = await Banner.create(req.body)
  res.status(201).json(banner)
})

router.put('/:id', protect, CAN_MANAGE, async (req, res) => {
  const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  })
  res.json(updated)
})

router.delete('/:id', protect, CAN_MANAGE, async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

export default router

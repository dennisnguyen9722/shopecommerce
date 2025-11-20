import express from 'express'
import Banner from '../models/Banner'
import { protect, adminOnly } from '../middleware/auth'

const router = express.Router()

router.use(protect, adminOnly)

// GET all banners
router.get('/', async (_req, res) => {
  const banners = await Banner.find().sort({ position: 1, order: 1 })
  res.json(banners)
})

// CREATE
router.post('/', async (req, res) => {
  const banner = await Banner.create(req.body)
  res.status(201).json(banner)
})

// UPDATE
router.put('/:id', async (req, res) => {
  const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  })
  res.json(updated)
})

// DELETE
router.delete('/:id', async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

export default router

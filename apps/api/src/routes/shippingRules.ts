import express from 'express'
import { protect, adminOnly } from '../middleware/auth'
import ShippingRule from '../models/ShippingRule'

const router = express.Router()
router.use(protect, adminOnly)

/**
 * GET all
 */
router.get('/', async (_req, res) => {
  const rules = await ShippingRule.find().sort({ order: 1, createdAt: -1 })
  res.json(rules)
})

/**
 * CREATE
 */
router.post('/', async (req, res) => {
  const {
    type,
    name,
    amount,
    threshold,
    areas,
    minWeight,
    maxWeight,
    province,
    districts
  } = req.body

  // VALIDATION
  if (type === 'location_based') {
    if (!areas || areas.length === 0) {
      return res.status(400).json({ error: 'areas is required' })
    }
    if (!amount) {
      return res.status(400).json({ error: 'amount is required' })
    }
  }

  if (type === 'district_based') {
    if (!province) {
      return res.status(400).json({ error: 'province is required' })
    }
    if (!districts || districts.length === 0) {
      return res.status(400).json({ error: 'districts are required' })
    }
    if (!amount) {
      return res.status(400).json({ error: 'amount is required' })
    }
  }

  if (type === 'weight_based') {
    if (minWeight == null || maxWeight == null) {
      return res
        .status(400)
        .json({ error: 'minWeight and maxWeight are required' })
    }
    if (!amount) {
      return res.status(400).json({ error: 'amount is required' })
    }
  }

  const count = await ShippingRule.countDocuments()

  const rule = await ShippingRule.create({
    type,
    name,
    amount,
    threshold,
    areas,
    minWeight,
    maxWeight,
    province,
    districts,
    order: count,
    isActive: true
  })

  res.status(201).json(rule)
})

router.put('/reorder', async (req, res) => {
  const { orderedIds } = req.body

  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds must be array' })
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await ShippingRule.findByIdAndUpdate(orderedIds[i], { order: i })
  }

  res.json({ ok: true })
})

/**
 * UPDATE
 */
router.put('/:id', async (req, res) => {
  const {
    type,
    name,
    amount,
    threshold,
    areas,
    minWeight,
    maxWeight,
    province,
    districts
  } = req.body

  // VALIDATION
  if (type === 'location_based') {
    if (!areas || areas.length === 0) {
      return res.status(400).json({ error: 'areas is required' })
    }
    if (!amount) {
      return res.status(400).json({ error: 'amount is required' })
    }
  }

  if (type === 'weight_based') {
    if (minWeight == null || maxWeight == null) {
      return res
        .status(400)
        .json({ error: 'minWeight and maxWeight are required' })
    }
    if (!amount) {
      return res.status(400).json({ error: 'amount is required' })
    }
  }

  if (type === 'district_based') {
    if (!province) {
      return res.status(400).json({ error: 'province is required' })
    }
    if (!districts || districts.length === 0) {
      return res.status(400).json({ error: 'districts are required' })
    }
    if (!amount) {
      return res.status(400).json({ error: 'amount is required' })
    }
  }

  const updated = await ShippingRule.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true
    }
  )

  if (!updated) return res.status(404).json({ error: 'Rule not found' })

  res.json(updated)
})

/**
 * DELETE
 */
router.delete('/:id', async (req, res) => {
  const deleted = await ShippingRule.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ error: 'Rule not found' })
  res.json({ ok: true })
})

export default router

import express from 'express'
import Banner from '../../models/Banner'

const router = express.Router()

router.get('/', async (_req, res) => {
  const banners = await Banner.find().sort({ position: 1, order: 1 })
  res.json(banners)
})

export default router

import express from 'express'

const router = express.Router()

/* ============================================================
   Get Vietnam Administrative Divisions (Provinces/Districts/Wards)
============================================================ */
router.get('/provinces', async (req, res) => {
  try {
    const depth = req.query.depth || '3'

    // Dùng fetch built-in của Node.js (v18+)
    const response = await fetch(
      `https://provinces.open-api.vn/api/?depth=${depth}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch provinces data')
    }

    const data = await response.json()

    // Cache response 24h (vì dữ liệu hành chính ít thay đổi)
    res.set('Cache-Control', 'public, max-age=86400')
    res.json(data)
  } catch (err: any) {
    console.error('Error fetching provinces:', err)
    res.status(500).json({
      error: 'Không thể tải dữ liệu địa chỉ',
      details: err.message
    })
  }
})

export default router

import express from 'express'
const router = express.Router()

router.get('/env/cloudinary', (req, res) => {
  res.json({
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'undefined',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || 'undefined',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
      ? 'OK'
      : 'undefined'
  })
})

export default router

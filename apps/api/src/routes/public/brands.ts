import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
// 👇 Import đúng Model Brand bạn vừa cung cấp
import Brand from '../../models/Brand'

const router = express.Router()

// ==========================================
// 1. GET ALL BRANDS (Lấy danh sách)
// ==========================================
// Dùng cho Slider trang chủ hoặc trang "Tất cả thương hiệu"
router.get('/', async (req: Request, res: Response) => {
  try {
    const brands = await Brand.find({ status: 'active' })
      .sort({ productsCount: -1, name: 1 }) // Ưu tiên brand nhiều SP, sau đó A-Z
      .select('name slug logo productsCount') // Chỉ lấy field cần thiết để nhẹ payload
      .lean()

    res.json(brands)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ==========================================
// 2. GET BRAND DETAIL (Chi tiết thương hiệu)
// ==========================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Logic thông minh: Kiểm tra xem user gửi lên là ID hay Slug
    const isObjectId = mongoose.Types.ObjectId.isValid(id)

    let brand

    if (isObjectId) {
      // Nếu là ID hợp lệ -> Tìm theo _id
      brand = await Brand.findOne({ _id: id, status: 'active' }).lean()
    } else {
      // Nếu không phải ID -> Tìm theo slug (VD: 'apple', 'samsung')
      brand = await Brand.findOne({ slug: id, status: 'active' }).lean()
    }

    if (!brand) {
      return res
        .status(404)
        .json({ error: 'Thương hiệu không tồn tại hoặc đã bị ẩn' })
    }

    res.json(brand)
  } catch (err: any) {
    console.error('Get Brand Error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router

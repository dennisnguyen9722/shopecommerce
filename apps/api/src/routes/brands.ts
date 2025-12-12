import express from 'express'
import Brand from '../models/Brand'
import Product from '../models/Product'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'

const router = express.Router()

// ✅ UPDATED: Sử dụng permissions mới
const CAN_READ = requirePermissions('brands.read')
const CAN_CREATE = requirePermissions('brands.create')
const CAN_UPDATE = requirePermissions('brands.update')
const CAN_DELETE = requirePermissions('brands.delete')

/* ------------------------------------------
   HELPER: Generate Slug
---------------------------------------------*/
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Xóa ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay space bằng -
    .replace(/-+/g, '-') // Xóa nhiều - liên tiếp
}

/* ------------------------------------------
   CREATE BRAND
---------------------------------------------*/
router.post('/', protect, CAN_CREATE, async (req, res) => {
  try {
    const { name, slug, description, logo, website, status } = req.body

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ error: 'Tên thương hiệu không được để trống' })
    }

    // Generate slug if not provided
    const finalSlug = slug?.trim() || generateSlug(name)

    // Check duplicate slug
    const existingSlug = await Brand.findOne({ slug: finalSlug })
    if (existingSlug) {
      return res.status(400).json({ error: 'Slug này đã tồn tại' })
    }

    // Check duplicate name
    const existing = await Brand.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    })

    if (existing) {
      return res.status(400).json({ error: 'Thương hiệu này đã tồn tại' })
    }

    const brand = await Brand.create({
      name: name.trim(),
      slug: finalSlug,
      description: description?.trim() || '',
      logo: logo || '',
      website: website || '',
      status: status || 'active'
    })

    res.status(201).json(brand)
  } catch (err: any) {
    console.error('❌ Error creating brand:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ------------------------------------------
   LIST BRANDS
---------------------------------------------*/
router.get('/', protect, CAN_READ, async (req, res) => {
  try {
    const {
      search = '',
      status = 'all',
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query

    const query: any = {}

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } }
      ]
    }

    // Status filter
    if (status !== 'all') {
      query.status = status
    }

    const skip = (Number(page) - 1) * Number(limit)

    // Sort options
    let sortOption: any = { createdAt: -1 } // Default: newest
    if (sort === 'oldest') sortOption = { createdAt: 1 }
    if (sort === 'name') sortOption = { name: 1 }
    if (sort === 'products') sortOption = { productsCount: -1 }

    const items = await Brand.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean()

    const total = await Brand.countDocuments(query)

    res.json({
      items,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    })
  } catch (err: any) {
    console.error('❌ Error listing brands:', err)
    res.status(500).json({ error: 'Internal error' })
  }
})

/* ------------------------------------------
   GET ALL BRANDS (No pagination - for dropdowns)
---------------------------------------------*/
router.get('/all', protect, CAN_READ, async (req, res) => {
  try {
    const brands = await Brand.find({ status: 'active' })
      .select('_id name slug logo')
      .sort({ name: 1 })
      .lean()

    res.json(brands)
  } catch (err: any) {
    console.error('❌ Error fetching all brands:', err)
    res.status(500).json({ error: 'Internal error' })
  }
})

/* ------------------------------------------
   GET BRAND DETAIL
---------------------------------------------*/
router.get('/:id', protect, CAN_READ, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id).lean()

    if (!brand) {
      return res.status(404).json({ error: 'Không tìm thấy thương hiệu' })
    }

    res.json(brand)
  } catch (err: any) {
    console.error('❌ Error fetching brand:', err)
    res.status(500).json({ error: 'Internal error' })
  }
})

/* ------------------------------------------
   UPDATE BRAND
---------------------------------------------*/
router.put('/:id', protect, CAN_UPDATE, async (req, res) => {
  try {
    const { name, slug, description, logo, website, status } = req.body

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ error: 'Tên thương hiệu không được để trống' })
    }

    // Generate slug if not provided
    const finalSlug = slug?.trim() || generateSlug(name)

    // Check duplicate slug (excluding current brand)
    const existingSlug = await Brand.findOne({
      _id: { $ne: req.params.id },
      slug: finalSlug
    })

    if (existingSlug) {
      return res.status(400).json({ error: 'Slug này đã tồn tại' })
    }

    // Check duplicate name (excluding current brand)
    const existing = await Brand.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    })

    if (existing) {
      return res.status(400).json({ error: 'Tên thương hiệu này đã tồn tại' })
    }

    const updated = await Brand.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || '',
        logo: logo || '',
        website: website || '',
        status: status || 'active'
      },
      { new: true }
    ).lean()

    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy thương hiệu' })
    }

    res.json(updated)
  } catch (err: any) {
    console.error('❌ Error updating brand:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ------------------------------------------
   DELETE BRAND
---------------------------------------------*/
router.delete('/:id', protect, CAN_DELETE, async (req, res) => {
  try {
    // Check if brand has products
    const productsCount = await Product.countDocuments({ brand: req.params.id })

    if (productsCount > 0) {
      return res.status(400).json({
        error: `Không thể xóa thương hiệu này vì đang có ${productsCount} sản phẩm liên kết`
      })
    }

    const deleted = await Brand.findByIdAndDelete(req.params.id)

    if (!deleted) {
      return res.status(404).json({ error: 'Không tìm thấy thương hiệu' })
    }

    res.json({ ok: true, message: 'Đã xóa thương hiệu thành công' })
  } catch (err: any) {
    console.error('❌ Error deleting brand:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ------------------------------------------
   BULK DELETE BRANDS
---------------------------------------------*/
router.post('/bulk-delete', protect, CAN_DELETE, async (req, res) => {
  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Danh sách IDs không hợp lệ' })
    }

    // Check if any brand has products
    const brandsWithProducts = await Product.aggregate([
      { $match: { brand: { $in: ids.map((id) => id) } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } }
    ])

    if (brandsWithProducts.length > 0) {
      return res.status(400).json({
        error: `Không thể xóa vì có thương hiệu đang có sản phẩm liên kết`
      })
    }

    const result = await Brand.deleteMany({ _id: { $in: ids } })

    res.json({
      ok: true,
      deletedCount: result.deletedCount,
      message: `Đã xóa ${result.deletedCount} thương hiệu`
    })
  } catch (err: any) {
    console.error('❌ Error bulk deleting brands:', err)
    res.status(500).json({ error: err.message })
  }
})

/* ------------------------------------------
   UPDATE BRAND STATUS
---------------------------------------------*/
router.patch('/:id/status', protect, CAN_UPDATE, async (req, res) => {
  try {
    const { status } = req.body

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' })
    }

    const updated = await Brand.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).lean()

    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy thương hiệu' })
    }

    res.json(updated)
  } catch (err: any) {
    console.error('❌ Error updating brand status:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router

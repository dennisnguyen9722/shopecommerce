import express from 'express'
import Category from '../models/Category'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'

const router = express.Router()

// 🔥 chỉ 1 quyền duy nhất
const CAN_MANAGE = requirePermissions('manage_categories')

// Helper tạo slug
const toSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')

// ======================================================================
// GET /admin/categories (list)
// ======================================================================
router.get('/', protect, CAN_MANAGE, async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      status = 'all',
      sort = 'newest'
    } = req.query as any

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20
    const skip = (pageNum - 1) * limitNum

    const filter: any = {}

    if (status === 'active') filter.isActive = true
    if (status === 'inactive') filter.isActive = false

    if (search && String(search).trim() !== '') {
      const keyword = String(search).trim()
      filter.$or = [
        { name: new RegExp(keyword, 'i') },
        { slug: new RegExp(keyword, 'i') }
      ]
    }

    const sortOption: any = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'name-asc': { name: 1 },
      'name-desc': { name: -1 }
    }[sort as string] || { createdAt: -1 }

    const [items, total] = await Promise.all([
      Category.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Category.countDocuments(filter)
    ])

    res.json({
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ======================================================================
// GET TREE
// ======================================================================
router.get('/tree', protect, CAN_MANAGE, async (_req, res) => {
  try {
    const cats = await Category.find({}).lean()

    const map: Record<string, any> = {}
    cats.forEach((cat: any) => {
      map[String(cat._id)] = { ...cat, children: [] }
    })

    const tree: any[] = []

    cats.forEach((cat: any) => {
      const id = String(cat._id)
      const parentId = cat.parent ? String(cat.parent) : null

      if (parentId && map[parentId]) {
        map[parentId].children.push(map[id])
      } else {
        tree.push(map[id])
      }
    })

    res.json(tree)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ======================================================================
// GET DETAIL
// ======================================================================
router.get('/:id', protect, CAN_MANAGE, async (req, res) => {
  try {
    const item = await Category.findById(req.params.id).lean()
    if (!item) return res.status(404).json({ error: 'Not found' })

    res.json(item)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ======================================================================
// CREATE CATEGORY
// ======================================================================
router.post('/', protect, CAN_MANAGE, async (req, res) => {
  try {
    const { name, slug, description, parent, isActive } = req.body

    if (!name || String(name).trim() === '') {
      return res.status(400).json({ error: 'Tên là bắt buộc' })
    }

    const finalSlug =
      slug && String(slug).trim() !== '' ? slug : toSlug(String(name))

    const existed = await Category.findOne({ slug: finalSlug })
    if (existed) {
      return res.status(400).json({ error: 'Slug đã tồn tại' })
    }

    const created = await Category.create({
      name,
      slug: finalSlug,
      description,
      parent: parent && parent !== '' && parent !== 'none' ? parent : null,
      isActive: typeof isActive === 'boolean' ? isActive : true
    })

    res.status(201).json(created)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ======================================================================
// UPDATE CATEGORY
// ======================================================================
router.put('/:id', protect, CAN_MANAGE, async (req, res) => {
  try {
    const { name, slug, description, parent, isActive } = req.body

    if (parent && parent === req.params.id) {
      return res
        .status(400)
        .json({ error: 'Danh mục không thể là con của chính nó' })
    }

    let finalSlug = slug

    if (!finalSlug || String(finalSlug).trim() === '') {
      if (!name || String(name).trim() === '') {
        return res.status(400).json({ error: 'Tên là bắt buộc' })
      }
      finalSlug = toSlug(String(name))
    }

    const existed = await Category.findOne({
      slug: finalSlug,
      _id: { $ne: req.params.id }
    })
    if (existed) {
      return res.status(400).json({ error: 'Slug đã tồn tại' })
    }

    const update: any = {
      name,
      slug: finalSlug,
      description,
      parent: parent && parent !== '' && parent !== 'none' ? parent : null,
      isActive
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, update, {
      new: true
    })

    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ======================================================================
// DELETE CATEGORY
// ======================================================================
router.delete('/:id', protect, CAN_MANAGE, async (req, res) => {
  try {
    const hasChildren = await Category.findOne({ parent: req.params.id })
    if (hasChildren) {
      return res.status(400).json({
        error: 'Không thể xoá danh mục đang có danh mục con'
      })
    }

    await Category.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ======================================================================
// BULK DELETE
// ======================================================================
router.post('/bulk-delete', protect, CAN_MANAGE, async (req, res) => {
  const { ids } = req.body

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Danh sách IDs không hợp lệ' })
  }

  await Category.deleteMany({ _id: { $in: ids } })

  res.json({ ok: true })
})

export default router

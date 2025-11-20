import express from 'express'
import Category from '../models/Category'
import { protect, adminOnly } from '../middleware/auth'

const router = express.Router()

// Tất cả routes dưới đây đều yêu cầu admin
router.use(protect, adminOnly)

// Helper tạo slug từ tên
const toSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')

// ======================================================================
// GET /admin/categories
//  -> List categories + search + filter + pagination + sort (chuẩn Shopify)
// ======================================================================
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      status = 'all', // all | active | inactive
      sort = 'newest' // newest | oldest | name-asc | name-desc
    } = req.query as any

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20
    const skip = (pageNum - 1) * limitNum

    // FILTER
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

    // SORT
    const sortOption: any = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'name-asc': { name: 1 },
      'name-desc': { name: -1 }
    }[sort as string] || { createdAt: -1 }

    // QUERY song song
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
// GET /admin/categories/tree
//  -> Trả về cây danh mục lồng nhau (parent/children) giống Shopify
// ======================================================================
router.get('/tree', async (_req, res) => {
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
// GET /admin/categories/:id
//  -> Lấy chi tiết 1 danh mục
// ======================================================================
router.get('/:id', async (req, res) => {
  try {
    const item = await Category.findById(req.params.id).lean()
    if (!item) return res.status(404).json({ error: 'Not found' })

    res.json(item)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ======================================================================
// POST /admin/categories
//  -> Tạo mới danh mục
// ======================================================================
router.post('/', async (req, res) => {
  try {
    const { name, slug, description, parent, isActive } = req.body

    if (!name || String(name).trim() === '') {
      return res.status(400).json({ error: 'Tên là bắt buộc' })
    }

    const finalSlug =
      slug && String(slug).trim() !== '' ? slug : toSlug(String(name))

    // Slug phải unique
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
// PUT /admin/categories/:id
//  -> Cập nhật danh mục
// ======================================================================
router.put('/:id', async (req, res) => {
  try {
    const { name, slug, description, parent, isActive } = req.body

    // Không cho parent là chính nó
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

    // Slug unique, trừ chính nó
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
// DELETE /admin/categories/:id
//  -> Xoá danh mục (chặn xoá nếu đang có danh mục con)
// ======================================================================
router.delete('/:id', async (req, res) => {
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

router.post('/bulk-delete', async (req, res) => {
  const { ids } = req.body

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Danh sách IDs không hợp lệ' })
  }

  await Category.deleteMany({ _id: { $in: ids } })

  res.json({ ok: true })
})

export default router

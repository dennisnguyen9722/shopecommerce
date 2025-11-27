import express from 'express'
import Customer from '../models/Customer'
import CustomerAddress from '../models/CustomerAddress'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'

const router = express.Router()

// ⭐ Chỉ cần quyền manage_customers
const CAN_CUSTOMERS = requirePermissions('manage_customers')

router.use(protect, CAN_CUSTOMERS)

const { faker } = require('@faker-js/faker')

const segments = {
  vip: { totalSpent: { $gte: 5_000_000 } },
  new: {
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  },
  inactive: {
    lastOrderDate: {
      $lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }
  }
} as const

// GET /admin/customers
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      segment = '',
      sort = 'newest',
      status = 'all'
    } = req.query as {
      page?: string
      limit?: string
      search?: string
      segment?: string
      sort?: string
      status?: string
    }

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20
    const skip = (pageNum - 1) * limitNum

    const filter: any = {}

    if (search && search.trim() !== '') {
      const keyword = search.trim()
      filter.$or = [
        { name: new RegExp(keyword, 'i') },
        { email: new RegExp(keyword, 'i') },
        { phone: new RegExp(keyword, 'i') }
      ]
    }

    if (status && status !== 'all') {
      filter.status = status
    }

    if (segment && (segments as any)[segment]) {
      Object.assign(filter, (segments as any)[segment])
    }

    const sortOption: any = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      totalSpent: { totalSpent: -1 },
      orders: { ordersCount: -1 }
    }[sort || ''] || { createdAt: -1 }

    const [items, total] = await Promise.all([
      Customer.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Customer.countDocuments(filter)
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

// GET /admin/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean()
    if (!customer) return res.status(404).json({ error: 'Not found' })

    const addresses = await CustomerAddress.find({
      customer: customer._id
    }).lean()

    res.json({ customer, addresses })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /admin/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, notes, tags, status } = req.body

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        notes,
        tags,
        status
      },
      { new: true }
    )

    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /admin/customers/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { status: 'deactivated' },
      { new: true }
    )
    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ADDRESS ROUTES
router.post('/:id/addresses', async (req, res) => {
  try {
    const address = await CustomerAddress.create({
      ...req.body,
      customer: req.params.id
    })

    if (req.body.isDefault) {
      await CustomerAddress.updateMany(
        { customer: req.params.id, _id: { $ne: address._id } },
        { isDefault: false }
      )
    }

    res.status(201).json(address)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id/addresses/:addressId', async (req, res) => {
  try {
    const updated = await CustomerAddress.findByIdAndUpdate(
      req.params.addressId,
      req.body,
      { new: true }
    )

    if (req.body.isDefault) {
      await CustomerAddress.updateMany(
        { customer: req.params.id, _id: { $ne: req.params.addressId } },
        { isDefault: false }
      )
    }

    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id/addresses/:addressId', async (req, res) => {
  try {
    await CustomerAddress.findByIdAndDelete(req.params.addressId)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Seed
router.post('/seed', async (req, res) => {
  try {
    await Customer.deleteMany({})
    await CustomerAddress.deleteMany({})

    const statuses = ['active', 'blocked', 'suspended', 'deactivated']

    const customers = []

    for (let i = 0; i < 20; i++) {
      const customer = await Customer.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number(),
        notes: faker.lorem.sentence(),
        tags: faker.helpers.arrayElements(['vip', 'new', 'loyal', 'hot'], 2),
        status: faker.helpers.arrayElement(statuses),
        totalSpent: faker.number.int({ min: 0, max: 20_000_000 }),
        ordersCount: faker.number.int({ min: 0, max: 20 }),
        createdAt: faker.date.recent({ days: 180 })
      })

      const addrCount = faker.number.int({ min: 1, max: 3 })

      for (let j = 0; j < addrCount; j++) {
        await CustomerAddress.create({
          customer: customer._id,
          fullName: customer.name,
          phone: customer.phone,
          addressLine1: faker.location.streetAddress(),
          addressLine2: faker.location.secondaryAddress(),
          ward: faker.location.city(),
          district: faker.location.county(),
          province: faker.location.state(),
          isDefault: j === 0
        })
      }

      customers.push(customer)
    }

    res.json({
      message: 'Seeded 20 customers successfully',
      count: customers.length
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router

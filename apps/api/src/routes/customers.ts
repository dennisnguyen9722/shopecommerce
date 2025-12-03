import express from 'express'
import Customer from '../models/Customer'
import CustomerAddress from '../models/CustomerAddress'
import Order from '../models/Order'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'

const router = express.Router()

const CAN_CUSTOMERS = requirePermissions('manage_customers')

router.use(protect, CAN_CUSTOMERS)

const segments = {
  vip: { totalSpent: { $gte: 10_000_000 } },
  premium: { totalSpent: { $gte: 5_000_000 } },
  new: {
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  },
  inactive: {
    lastOrderDate: {
      $lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }
  }
} as const

// 🆕 SYNC CUSTOMERS FROM ORDERS
router.post('/sync-from-orders', async (req, res) => {
  try {
    const orders = await Order.find({})
      .select(
        'customerName customerEmail customerPhone totalPrice createdAt status'
      )
      .lean()

    let created = 0
    let updated = 0

    // Nhóm orders theo email
    const emailMap = new Map<string, any[]>()

    for (const order of orders) {
      if (!order.customerEmail) continue

      const email = order.customerEmail.toLowerCase()
      if (!emailMap.has(email)) {
        emailMap.set(email, [])
      }
      emailMap.get(email)!.push(order)
    }

    // Xử lý từng email
    for (const [email, customerOrders] of emailMap.entries()) {
      const existing = await Customer.findOne({ email })

      // Tính stats từ orders (không tính cancelled)
      const validOrders = customerOrders.filter((o) => o.status !== 'cancelled')
      const totalSpent = validOrders.reduce(
        (sum, o) => sum + (o.totalPrice || 0),
        0
      )
      const ordersCount = validOrders.length
      const lastOrderDate =
        validOrders.length > 0
          ? new Date(
              Math.max(
                ...validOrders.map((o) => new Date(o.createdAt).getTime())
              )
            )
          : null

      // Tính loyalty points: 1 điểm = 1000đ
      const loyaltyPoints = Math.floor(totalSpent / 1000)

      if (existing) {
        // Update
        existing.totalSpent = totalSpent
        existing.ordersCount = ordersCount
        existing.lastOrderDate = lastOrderDate
        existing.loyaltyPoints = loyaltyPoints

        await existing.save()
        updated++
      } else {
        // Create new
        const firstOrder = customerOrders[0]

        await Customer.create({
          name: firstOrder.customerName || 'Guest',
          email: email,
          phone: firstOrder.customerPhone,
          password: null,
          totalSpent,
          ordersCount,
          lastOrderDate,
          loyaltyPoints,
          status: 'active'
        })

        created++
      }
    }

    res.json({ created, updated })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /admin/customers
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      segment = '',
      sort = 'newest',
      status = ''
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

    if (status && status !== 'all' && status !== '') {
      filter.status = status
    }

    if (segment && (segments as any)[segment]) {
      Object.assign(filter, (segments as any)[segment])
    }

    const sortOption: any = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      totalSpent: { totalSpent: -1 },
      orders: { ordersCount: -1 },
      points: { loyaltyPoints: -1 }
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

    const [addresses, orders] = await Promise.all([
      CustomerAddress.find({ customer: customer._id }).lean(),
      Order.find({ customerEmail: customer.email })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
    ])

    res.json({ customer, addresses, orders })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /admin/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      notes,
      tags,
      status,
      loyaltyPoints,
      loyaltyTier
    } = req.body

    const customer = await Customer.findById(req.params.id)
    if (!customer) return res.status(404).json({ error: 'Not found' })

    customer.name = name || customer.name
    customer.email = email || customer.email
    customer.phone = phone || customer.phone
    customer.notes = notes
    customer.tags = tags || customer.tags
    customer.status = status || customer.status

    // Admin có thể override loyalty
    if (loyaltyPoints !== undefined) {
      customer.loyaltyPoints = loyaltyPoints
    }
    if (loyaltyTier !== undefined) {
      customer.loyaltyTier = loyaltyTier
    }

    await customer.save()

    res.json(customer)
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

// 🆕 ADDRESS ROUTES
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

export default router

import express from 'express'
import jwt from 'jsonwebtoken'
import Customer from '../models/Customer'

const router = express.Router()

// 🆕 REGISTER - Khách hàng đăng ký để tham gia loyalty
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' })
    }

    // Check existing
    const existing = await Customer.findOne({ email: email.toLowerCase() })
    if (existing && existing.password !== null) {
      return res.status(400).json({ error: 'Email đã được đăng ký' })
    }

    // Nếu đã có customer từ guest checkout, update thêm password
    if (existing && existing.password === null) {
      existing.name = name
      existing.password = password
      existing.phone = phone || existing.phone
      await existing.save()

      const token = jwt.sign(
        { id: existing._id, email: existing.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '30d' }
      )

      return res.status(201).json({
        token,
        customer: {
          id: existing._id,
          name: existing.name,
          email: existing.email,
          phone: existing.phone,
          loyaltyPoints: existing.loyaltyPoints,
          loyaltyTier: existing.loyaltyTier,
          totalSpent: existing.totalSpent,
          ordersCount: existing.ordersCount
        }
      })
    }

    // Create new
    const customer = await Customer.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      status: 'active'
    })

    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    )

    res.status(201).json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        loyaltyPoints: customer.loyaltyPoints,
        loyaltyTier: customer.loyaltyTier,
        totalSpent: customer.totalSpent,
        ordersCount: customer.ordersCount
      }
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// 🆕 LOGIN - Khách hàng đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' })
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() })

    if (!customer || !customer.password) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
    }

    if (customer.status !== 'active') {
      return res
        .status(403)
        .json({ error: 'Tài khoản đã bị khóa hoặc ngưng hoạt động' })
    }

    const isMatch = await customer.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
    }

    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    )

    res.json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        loyaltyPoints: customer.loyaltyPoints,
        loyaltyTier: customer.loyaltyTier,
        totalSpent: customer.totalSpent,
        ordersCount: customer.ordersCount
      }
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// 🆕 GET PROFILE - Lấy thông tin khách hàng hiện tại
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Không có token' })
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const customer = await Customer.findById(decoded.id).select('-password')

    if (!customer) {
      return res.status(404).json({ error: 'Không tìm thấy khách hàng' })
    }

    res.json(customer)
  } catch (err: any) {
    res.status(401).json({ error: 'Token không hợp lệ' })
  }
})

export default router

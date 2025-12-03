// apps/api/src/routes/public/auth.ts
import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Customer from '../../models/Customer'

const router = express.Router()

// ĐĂNG KÝ
router.post('/register', async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body

    const existingCustomer = await Customer.findOne({ email })
    if (existingCustomer) {
      return res.status(400).json({ error: 'Email đã được sử dụng' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newCustomer = await Customer.create({
      name,
      email,
      password: hashedPassword,
      status: 'active',
      loyaltyPoints: 0,
      loyaltyTier: 'bronze',
      avatar: null // Mặc định null
    })

    const token = jwt.sign(
      { id: newCustomer._id, role: 'customer' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        _id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email,
        role: 'customer',
        loyaltyPoints: newCustomer.loyaltyPoints,
        loyaltyTier: newCustomer.loyaltyTier,
        // 👇 TypeScript sẽ hết báo lỗi dòng này sau khi sửa Model
        avatar: newCustomer.avatar
      }
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ĐĂNG NHẬP
router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body

    const customer = await Customer.findOne({ email })
    if (!customer) {
      return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng' })
    }

    // 👇 FIX LỖI BCRYPT: Kiểm tra nếu password trong DB bị null (trường hợp login GG/FB)
    if (!customer.password) {
      return res
        .status(400)
        .json({ error: 'Tài khoản này đăng nhập bằng phương thức khác' })
    }

    // Lúc này TypeScript biết customer.password chắc chắn là string
    const isMatch = await bcrypt.compare(password, customer.password)

    if (!isMatch) {
      return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng' })
    }

    if (customer.status !== 'active') {
      return res.status(403).json({ error: 'Tài khoản đã bị khóa' })
    }

    const token = jwt.sign(
      { id: customer._id, role: 'customer' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        role: 'customer',
        loyaltyPoints: customer.loyaltyPoints,
        loyaltyTier: customer.loyaltyTier,
        // 👇 TypeScript hết lỗi
        avatar: customer.avatar
      }
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router

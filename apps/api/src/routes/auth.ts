import { Router } from 'express'
import User from '../models/User'
import { AppError } from '../utils/AppError'
import { generateToken } from '../utils/jwt'

const router = Router()

// 🧑‍💻 Đăng ký
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) throw new AppError('Email đã được sử dụng', 400)

  const user = await User.create({ name, email, password, role })
  const token = generateToken(user._id, user.role)

  res.json({
    message: 'Đăng ký thành công',
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token
  })
})

// 🔑 Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (!user) throw new AppError('Không tìm thấy người dùng', 404)

  const isMatch = await user.matchPassword(password)
  if (!isMatch) throw new AppError('Sai mật khẩu', 401)

  const token = generateToken(user._id, user.role)

  res.json({
    message: 'Đăng nhập thành công',
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token
  })
})

export default router

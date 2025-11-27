import { Router } from 'express'
import User from '../models/User'
import Role from '../models/Role'
import { AppError } from '../utils/AppError'
import { generateToken } from '../utils/jwt'

const router = Router()

// ===============================
// REGISTER
// ===============================
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body

  const existing = await User.findOne({ email })
  if (existing) throw new AppError('Email đã được sử dụng', 400)

  // role phải là ObjectId (roleId)
  const user = await User.create({
    name,
    email,
    password,
    role // roleId
  })

  // populate role + permissions
  await user.populate('role')

  const permissions = user.role?.permissions || []
  const token = generateToken(user._id, permissions)

  res.json({
    message: 'Đăng ký thành công',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions
    }
  })
})

// ===============================
// LOGIN
// ===============================
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  // ⭐ cần populate role để có permissions
  const user = await User.findOne({ email }).populate('role')

  if (!user) throw new AppError('Không tìm thấy người dùng', 404)

  const isMatch = await user.matchPassword(password)
  if (!isMatch) throw new AppError('Sai mật khẩu', 401)

  const permissions = user.role?.permissions || []
  const token = generateToken(user._id, permissions)

  res.json({
    message: 'Đăng nhập thành công',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions
    }
  })
})

export default router

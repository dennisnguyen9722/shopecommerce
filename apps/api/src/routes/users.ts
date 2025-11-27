import express from 'express'
import User from '../models/User'
import Role from '../models/Role'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'

const router = express.Router()

// ⭐ Quyền quản lý tài khoản (Users)
const CAN_MANAGE_USERS = requirePermissions('manage_users')

// Áp dụng cho tất cả route trong file
router.use(protect, CAN_MANAGE_USERS)

/* ================================
   GET ALL USERS
================================ */
router.get('/', async (_req, res) => {
  const users = await User.find()
    .populate('role', 'name permissions')
    .sort({ createdAt: -1 })

  res.json(users)
})

/* ================================
   CREATE USER
================================ */
router.post('/', async (req, res) => {
  const { name, email, password, roleId } = req.body

  const existed = await User.findOne({ email })
  if (existed) {
    return res.status(400).json({ error: 'Email đã tồn tại' })
  }

  const user = await User.create({
    name,
    email,
    password,
    role: roleId || null
  })

  res.json(user)
})

/* ================================
   ASSIGN ROLE
   PUT /admin/users/:id/role
================================ */
router.put('/:id/role', async (req, res) => {
  const { roleId } = req.body

  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'User không tồn tại' })

  const role = await Role.findById(roleId)
  if (!role) return res.status(404).json({ error: 'Role không tồn tại' })

  user.role = roleId
  await user.save()

  const populated = await User.findById(user._id).populate(
    'role',
    'name permissions'
  )

  res.json({
    ok: true,
    user: populated
  })
})

/* ================================
   REMOVE ROLE
================================ */
router.delete('/:id/role', async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'User không tồn tại' })

  user.role = null
  await user.save()

  res.json({ ok: true })
})

export default router

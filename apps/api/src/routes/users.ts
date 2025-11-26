import express from 'express'
import User from '../models/User'
import Role from '../models/Role'
import { protect, adminOnly } from '../middleware/auth'

const router = express.Router()

router.use(protect, adminOnly)

/* ================================
   GET ALL USERS (for admin)
================================ */
router.get('/', async (req, res) => {
  const users = await User.find()
    .populate('role', 'name permissions')
    .sort({ createdAt: -1 })

  res.json(users)
})

router.post('/', async (req, res) => {
  const { name, email, password, roleId } = req.body

  const user = await User.create({
    name,
    email,
    password,
    role: roleId || null
  })

  res.json(user)
})

/* ================================
   ASSIGN ROLE TO USER
   PUT /admin/users/:id/role
================================ */
router.put('/:id/role', async (req, res) => {
  const { roleId } = req.body

  // Check user exists
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'User không tồn tại' })

  // Check role exists
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
   REMOVE USER ROLE
   DELETE /admin/users/:id/role
================================ */
router.delete('/:id/role', async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'User không tồn tại' })

  user.role = null
  await user.save()

  res.json({ ok: true })
})

export default router

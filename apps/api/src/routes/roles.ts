import express from 'express'
import Role from '../models/Role'
import { protect } from '../middleware/auth'
import { requirePermissions } from '../middleware/requirePermissions'

const router = express.Router()

// ⭐ Role management = cần quyền manage_roles
const CAN_MANAGE_ROLES = requirePermissions('manage_roles')

router.use(protect, CAN_MANAGE_ROLES)

/* ================================
   GET ALL ROLES
================================ */
router.get('/', async (_req, res) => {
  const roles = await Role.find().sort({ createdAt: -1 })
  res.json(roles)
})

/* ================================
   GET ROLE BY ID
================================ */
router.get('/:id', async (req, res) => {
  const role = await Role.findById(req.params.id)
  if (!role) return res.status(404).json({ error: 'Role không tồn tại' })

  res.json(role)
})

/* ================================
   CREATE ROLE
================================ */
router.post('/', async (req, res) => {
  const { name, description, permissions } = req.body

  const exists = await Role.findOne({ name })
  if (exists) {
    return res.status(400).json({ error: 'Tên role đã tồn tại' })
  }

  const role = await Role.create({
    name,
    description: description || '',
    permissions: permissions || [],
    isSystem: false
  })

  res.status(201).json(role)
})

/* ================================
   UPDATE ROLE
================================ */
router.put('/:id', async (req, res) => {
  const role = await Role.findById(req.params.id)
  if (!role) return res.status(404).json({ error: 'Role không tồn tại' })

  if (role.isSystem) {
    return res.status(403).json({ error: 'Không thể sửa role hệ thống' })
  }

  const { name, description, permissions } = req.body

  role.name = name ?? role.name
  role.description = description ?? role.description
  role.permissions = permissions ?? role.permissions

  const updated = await role.save()

  res.json(updated)
})

/* ================================
   DELETE ROLE
================================ */
router.delete('/:id', async (req, res) => {
  const role = await Role.findById(req.params.id)
  if (!role) return res.status(404).json({ error: 'Role không tồn tại' })

  if (role.isSystem) {
    return res.status(403).json({ error: 'Không thể xóa role hệ thống' })
  }

  await role.deleteOne()

  res.json({ ok: true })
})

export default router

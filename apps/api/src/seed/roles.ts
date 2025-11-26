import Role from '../models/Role'
import { ALL_PERMISSIONS } from '../constants/permissions'

export async function seedSuperAdminRole() {
  const exists = await Role.findOne({ name: 'Super Admin' })

  if (!exists) {
    await Role.create({
      name: 'Super Admin',
      description: 'Full quyền hệ thống',
      permissions: ALL_PERMISSIONS,
      isSystem: true
    })
    console.log('>> Super Admin role created')
  }
}

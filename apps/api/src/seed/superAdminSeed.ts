// backend/src/seed/superAdminSeed.ts
import Role from '../models/Role'
import User from '../models/User'
import { ALL_PERMISSIONS } from '../constants/permissions'

export const seedSuperAdmin = async () => {
  try {
    console.log('🔄 Đang đồng bộ quyền Super Admin...')

    // 1. Tìm hoặc tạo Role "Super Admin"
    let adminRole = await Role.findOne({ name: 'Super Admin' })

    if (!adminRole) {
      // Tạo mới nếu chưa có
      adminRole = await Role.create({
        name: 'Super Admin',
        description: 'Quản trị viên cấp cao nhất (Full quyền)',
        permissions: ALL_PERMISSIONS,
        isSystem: true
      })
      console.log('✅ Đã tạo mới Role Super Admin')
    } else {
      // Cập nhật permissions mới nhất
      adminRole.permissions = ALL_PERMISSIONS
      adminRole.description = 'Quản trị viên cấp cao nhất (Full quyền)'
      adminRole.isSystem = true
      await adminRole.save()
      console.log('✅ Đã cập nhật permissions cho Role Super Admin')
    }

    // 2. Đảm bảo User Admin có role này
    const myEmail = 'admin@example.com' // 👈 Email admin của bạn
    const myAdmin = await User.findOne({ email: myEmail })

    if (myAdmin) {
      // ✅ GÁN OBJECTID CHỨ KHÔNG PHẢI STRING
      myAdmin.role = adminRole._id
      await myAdmin.save()
      console.log(`✅ Đã cấp quyền Super Admin cho: ${myEmail}`)
    } else {
      console.log(`⚠️  Không tìm thấy user với email: ${myEmail}`)
    }

    // 3. Log ra tất cả permissions hiện tại
    console.log(`📋 Tổng số permissions: ${ALL_PERMISSIONS.length}`)
    console.log(`📋 Permissions bao gồm:`, ALL_PERMISSIONS)
  } catch (error) {
    console.error('❌ Lỗi khi seed Super Admin:', error)
  }
}

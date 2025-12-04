import Role from '../models/Role'
import User from '../models/User'
import { ALL_PERMISSIONS } from '../constants/permissions' // 👈 Import mảng quyền chuẩn từ file constant

export const seedSuperAdmin = async () => {
  try {
    console.log('🔄 Đang đồng bộ quyền Super Admin...')

    // 1. Tìm Role "Super Admin" trong Database
    // (Hoặc tìm theo _id nếu bạn sợ trùng tên, nhưng tên thường là duy nhất)
    let adminRole = await Role.findOne({ name: 'Super Admin' })

    if (!adminRole) {
      // 2a. Nếu chưa có -> Tạo mới
      adminRole = await Role.create({
        name: 'Super Admin',
        description: 'Quản trị viên cấp cao nhất (Full quyền)',
        permissions: ALL_PERMISSIONS, // Gán tất cả quyền mới nhất
        isSystem: true // Đánh dấu đây là role hệ thống, không xóa được
      })
      console.log('✅ Đã tạo mới Role Super Admin')
    } else {
      // 2b. Nếu đã có -> CẬP NHẬT lại permissions
      // Bước này cực quan trọng để fix lỗi "lệch pha" quyền cũ/mới
      adminRole.permissions = ALL_PERMISSIONS

      // Update thêm description nếu cần
      adminRole.description = 'Quản trị viên cấp cao nhất (Full quyền)'

      await adminRole.save()
      console.log('✅ Đã cập nhật permissions cho Role Super Admin')
    }

    // ---------------------------------------------------------
    // 3. (Tùy chọn) Đảm bảo User Admin của bạn đang có Role này
    // ---------------------------------------------------------
    const myEmail = 'duypagau@gmail.com' // 👈 Thay email của bạn vào đây
    const myAdmin = await User.findOne({ email: myEmail })

    if (myAdmin) {
      // Gán role vừa update vào user này
      myAdmin.role = 'admin' // Role string (để bypass logic cũ)
      // Nếu logic mới của bạn dùng reference tới Role ID thì bỏ comment dòng dưới:
      // myAdmin.roleId = adminRole._id;

      await myAdmin.save()
      console.log(`✅ Đã cấp lại quyền Admin cho: ${myEmail}`)
    }
  } catch (error) {
    console.error('❌ Lỗi khi seed Super Admin:', error)
  }
}

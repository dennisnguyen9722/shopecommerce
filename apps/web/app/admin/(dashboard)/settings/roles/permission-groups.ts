import { PERMISSIONS } from '@/src/constants/permissions'

export const PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    permissions: [
      { key: PERMISSIONS.DASHBOARD.VIEW, label: 'Xem trang tổng quan' }
    ]
  },
  {
    label: 'Sản phẩm',
    permissions: [
      { key: PERMISSIONS.PRODUCTS.READ, label: 'Xem danh sách sản phẩm' },
      { key: PERMISSIONS.PRODUCTS.CREATE, label: 'Thêm mới sản phẩm' },
      { key: PERMISSIONS.PRODUCTS.UPDATE, label: 'Chỉnh sửa sản phẩm' },
      { key: PERMISSIONS.PRODUCTS.DELETE, label: 'Xóa sản phẩm' }
    ]
  },
  {
    label: 'Danh mục',
    permissions: [
      { key: PERMISSIONS.CATEGORIES.READ, label: 'Xem danh mục' },
      { key: PERMISSIONS.CATEGORIES.CREATE, label: 'Tạo danh mục' },
      { key: PERMISSIONS.CATEGORIES.UPDATE, label: 'Sửa danh mục' },
      { key: PERMISSIONS.CATEGORIES.DELETE, label: 'Xóa danh mục' }
    ]
  },
  // ✅ NEW: Thương hiệu
  {
    label: 'Thương hiệu',
    permissions: [
      { key: PERMISSIONS.BRANDS.READ, label: 'Xem thương hiệu' },
      { key: PERMISSIONS.BRANDS.CREATE, label: 'Tạo thương hiệu' },
      { key: PERMISSIONS.BRANDS.UPDATE, label: 'Sửa thương hiệu' },
      { key: PERMISSIONS.BRANDS.DELETE, label: 'Xóa thương hiệu' }
    ]
  },
  {
    label: 'Đơn hàng',
    permissions: [
      { key: PERMISSIONS.ORDERS.READ, label: 'Xem đơn hàng' },
      { key: PERMISSIONS.ORDERS.UPDATE, label: 'Cập nhật trạng thái đơn' },
      { key: PERMISSIONS.ORDERS.DELETE, label: 'Xóa đơn hàng' }
    ]
  },
  {
    label: 'Khách hàng',
    permissions: [
      { key: PERMISSIONS.CUSTOMERS.READ, label: 'Xem khách hàng' },
      { key: PERMISSIONS.CUSTOMERS.UPDATE, label: 'Cập nhật khách hàng' },
      { key: PERMISSIONS.CUSTOMERS.DELETE, label: 'Xóa khách hàng' }
    ]
  },
  {
    label: 'Kho hàng',
    permissions: [
      { key: PERMISSIONS.INVENTORY.READ, label: 'Xem tồn kho' },
      { key: PERMISSIONS.INVENTORY.UPDATE, label: 'Nhập/Xuất kho' }
    ]
  },
  {
    label: 'Blog / Tin tức',
    permissions: [
      { key: PERMISSIONS.BLOG.READ, label: 'Xem bài viết' },
      { key: PERMISSIONS.BLOG.CREATE, label: 'Tạo bài viết' },
      { key: PERMISSIONS.BLOG.UPDATE, label: 'Sửa bài viết' },
      { key: PERMISSIONS.BLOG.DELETE, label: 'Xóa bài viết' }
    ]
  },
  {
    label: 'Đánh giá sản phẩm',
    permissions: [
      { key: PERMISSIONS.REVIEWS.READ, label: 'Xem đánh giá' },
      { key: PERMISSIONS.REVIEWS.CREATE, label: 'Tạo đánh giá' },
      { key: PERMISSIONS.REVIEWS.UPDATE, label: 'Sửa đánh giá' },
      { key: PERMISSIONS.REVIEWS.DELETE, label: 'Xóa đánh giá' },
      { key: PERMISSIONS.REVIEWS.MANAGE, label: 'Duyệt/Ẩn đánh giá' }
    ]
  },
  {
    label: 'Marketing & Loyalty',
    permissions: [
      { key: PERMISSIONS.BANNERS.MANAGE, label: 'Quản lý Banner/Slider' },
      { key: PERMISSIONS.REWARDS.MANAGE, label: 'Quản lý Đổi quà & Voucher' }
    ]
  },
  {
    label: 'Khuyến mãi',
    permissions: [
      { key: PERMISSIONS.COUPONS.MANAGE, label: 'Quản lý mã giảm giá (Coupon)' }
    ]
  },
  {
    label: 'Hệ thống',
    permissions: [
      {
        key: PERMISSIONS.SETTINGS.MANAGE,
        label: 'Cài đặt chung (Ship/Payment)'
      },
      {
        key: PERMISSIONS.SETTINGS.VIEW_ANALYTICS,
        label: 'Xem báo cáo Analytics'
      },
      {
        key: PERMISSIONS.SETTINGS.EXPORT_DATA,
        label: 'Xuất dữ liệu (Export Excel/CSV)'
      },
      {
        key: PERMISSIONS.SYSTEM.MANAGE_USERS,
        label: 'Quản lý tài khoản Admin'
      },
      { key: PERMISSIONS.SYSTEM.MANAGE_ROLES, label: 'Quản lý Phân quyền' }
    ]
  }
]

export const PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    permissions: [{ key: 'view_dashboard', label: 'Xem trang quản trị' }]
  },
  {
    label: 'Sản phẩm',
    permissions: [
      { key: 'manage_products', label: 'Quản lý sản phẩm (tất cả)' },
      { key: 'products.read', label: 'Xem sản phẩm' },
      { key: 'products.create', label: 'Tạo sản phẩm' },
      { key: 'products.update', label: 'Cập nhật sản phẩm' },
      { key: 'products.delete', label: 'Xóa sản phẩm' }
    ]
  },
  {
    label: 'Danh mục',
    permissions: [
      { key: 'manage_categories', label: 'Quản lý danh mục (tất cả)' },
      { key: 'categories.read', label: 'Xem danh mục' },
      { key: 'categories.create', label: 'Tạo danh mục' },
      { key: 'categories.update', label: 'Cập nhật danh mục' },
      { key: 'categories.delete', label: 'Xóa danh mục' }
    ]
  },
  {
    label: 'Đơn hàng',
    permissions: [
      { key: 'manage_orders', label: 'Quản lý đơn hàng (tất cả)' },
      { key: 'orders.read', label: 'Xem đơn hàng' },
      { key: 'orders.update', label: 'Cập nhật đơn hàng' },
      { key: 'orders.delete', label: 'Xóa đơn hàng' }
    ]
  },
  {
    label: 'Khách hàng',
    permissions: [
      { key: 'manage_customers', label: 'Quản lý khách hàng (tất cả)' },
      { key: 'customers.read', label: 'Xem khách hàng' },
      { key: 'customers.update', label: 'Cập nhật khách hàng' },
      { key: 'customers.delete', label: 'Xóa khách hàng' }
    ]
  },
  {
    label: 'Kho hàng',
    permissions: [
      { key: 'manage_inventory', label: 'Quản lý kho hàng' },
      { key: 'inventory.read', label: 'Xem kho hàng' },
      { key: 'inventory.update', label: 'Cập nhật kho hàng' }
    ]
  },
  {
    label: 'Blog / Tin tức',
    permissions: [
      { key: 'manage_blog', label: 'Quản lý blog (tất cả)' },
      { key: 'blog.read', label: 'Xem bài viết' },
      { key: 'blog.create', label: 'Tạo bài viết' },
      { key: 'blog.update', label: 'Cập nhật bài viết' },
      { key: 'blog.delete', label: 'Xóa bài viết' }
    ]
  },
  {
    label: 'Banner & Marketing',
    permissions: [{ key: 'manage_banners', label: 'Quản lý banner' }]
  },
  {
    label: 'Phân tích & Báo cáo',
    permissions: [{ key: 'view_analytics', label: 'Xem báo cáo & thống kê' }]
  },
  {
    label: 'Cài đặt',
    permissions: [{ key: 'manage_settings', label: 'Quản lý cài đặt hệ thống' }]
  },
  {
    label: 'Quản lý hệ thống',
    permissions: [
      { key: 'manage_users', label: 'Quản lý tài khoản' },
      { key: 'manage_roles', label: 'Quản lý phân quyền' },
      { key: 'users.read', label: 'Xem tài khoản' },
      { key: 'users.create', label: 'Tạo tài khoản' },
      { key: 'users.update', label: 'Cập nhật tài khoản' },
      { key: 'users.delete', label: 'Xóa tài khoản' }
    ]
  }
]

export const PERMISSION_GROUPS = [
  {
    label: 'Sản phẩm',
    permissions: [
      { key: 'products.read', label: 'Xem sản phẩm' },
      { key: 'products.create', label: 'Tạo sản phẩm' },
      { key: 'products.update', label: 'Cập nhật sản phẩm' },
      { key: 'products.delete', label: 'Xóa sản phẩm' }
    ]
  },
  {
    label: 'Đơn hàng',
    permissions: [
      { key: 'orders.read', label: 'Xem đơn hàng' },
      { key: 'orders.update', label: 'Cập nhật đơn hàng' }
    ]
  },
  {
    label: 'Khách hàng',
    permissions: [
      { key: 'customers.read', label: 'Xem khách hàng' },
      { key: 'customers.update', label: 'Cập nhật khách hàng' }
    ]
  },
  {
    label: 'Blog / Tin tức',
    permissions: [
      { key: 'blog.read', label: 'Xem bài viết' },
      { key: 'blog.write', label: 'Quản lý bài viết' }
    ]
  },
  {
    label: 'Cài đặt',
    permissions: [{ key: 'settings.manage', label: 'Quản lý cài đặt' }]
  },
  {
    label: 'Quản lý hệ thống',
    permissions: [
      { key: 'users.manage', label: 'Quản lý tài khoản' },
      { key: 'roles.manage', label: 'Quản lý phân quyền' }
    ]
  }
]

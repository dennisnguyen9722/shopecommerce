export const PERMISSION_ROUTES = [
  {
    perms: [
      'products.read',
      'products.create',
      'products.update',
      'products.delete'
    ],
    route: '/admin/products'
  },
  {
    perms: [
      'categories.read',
      'categories.create',
      'categories.update',
      'categories.delete'
    ],
    route: '/admin/categories'
  },
  {
    perms: [
      'customers.read',
      'customers.create',
      'customers.update',
      'customers.delete'
    ],
    route: '/admin/customers'
  },
  {
    perms: ['orders.read', 'orders.update'],
    route: '/admin/orders'
  },
  {
    perms: ['banners.manage'],
    route: '/admin/banners'
  },
  {
    perms: ['roles.manage'],
    route: '/admin/settings/roles'
  },
  {
    perms: ['users.manage'],
    route: '/admin/settings/users'
  },
  {
    perms: ['dashboard.view'],
    route: '/admin/overview'
  }
]

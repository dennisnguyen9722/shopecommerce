export const PERMISSIONS = {
  products: {
    read: 'products.read',
    create: 'products.create',
    update: 'products.update',
    delete: 'products.delete'
  },
  orders: {
    read: 'orders.read',
    update: 'orders.update'
  },
  customers: {
    read: 'customers.read',
    update: 'customers.update'
  },
  blog: {
    read: 'blog.read',
    write: 'blog.write'
  },
  settings: {
    manage: 'settings.manage'
  },
  roles: {
    manage: 'roles.manage'
  },
  users: {
    manage: 'users.manage'
  }
}

// Flatten list
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap((group) =>
  typeof group === 'string' ? group : Object.values(group)
)

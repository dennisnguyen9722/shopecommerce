export const PERMISSIONS = {
  DASHBOARD: {
    VIEW: 'dashboard.view'
  },
  PRODUCTS: {
    READ: 'products.read',
    CREATE: 'products.create',
    UPDATE: 'products.update',
    DELETE: 'products.delete'
  },
  CATEGORIES: {
    READ: 'categories.read',
    CREATE: 'categories.create',
    UPDATE: 'categories.update',
    DELETE: 'categories.delete'
  },
  ORDERS: {
    READ: 'orders.read',
    UPDATE: 'orders.update',
    DELETE: 'orders.delete'
  },
  CUSTOMERS: {
    READ: 'customers.read',
    UPDATE: 'customers.update',
    DELETE: 'customers.delete'
  },
  INVENTORY: {
    READ: 'inventory.read',
    UPDATE: 'inventory.update'
  },
  BLOG: {
    READ: 'blog.read',
    CREATE: 'blog.create',
    UPDATE: 'blog.update',
    DELETE: 'blog.delete'
  },
  BANNERS: {
    MANAGE: 'banners.manage' // Hoặc chi tiết ra read/create/update/delete nếu cần
  },
  REWARDS: {
    MANAGE: 'rewards.manage' // Loyalty
  },
  REVIEWS: {
    READ: 'reviews.read',
    CREATE: 'reviews.create',
    UPDATE: 'reviews.update',
    DELETE: 'reviews.delete',
    MANAGE: 'reviews.manage'
  },
  COUPONS: {
    MANAGE: 'coupons.manage'
  },
  SETTINGS: {
    MANAGE: 'settings.manage', // Chung cho payment/shipping
    VIEW_ANALYTICS: 'settings.view_analytics',
    EXPORT_DATA: 'settings.export_data'
  },
  SYSTEM: {
    MANAGE_USERS: 'users.manage',
    MANAGE_ROLES: 'roles.manage'
  }
} as const

// Helper để lấy danh sách tất cả quyền (cho Super Admin nếu cần)
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap((group) =>
  Object.values(group)
)

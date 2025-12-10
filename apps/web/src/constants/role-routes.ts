import { PERMISSIONS } from '@/src/constants/permissions'

export const PERMISSION_ROUTES = [
  {
    perms: [PERMISSIONS.PRODUCTS.READ],
    route: '/admin/products'
  },
  {
    perms: [PERMISSIONS.CATEGORIES.READ],
    route: '/admin/categories'
  },
  {
    perms: [PERMISSIONS.ORDERS.READ],
    route: '/admin/orders'
  },
  {
    perms: [PERMISSIONS.CUSTOMERS.READ],
    route: '/admin/customers'
  },
  {
    perms: [PERMISSIONS.REVIEWS.READ],
    route: '/admin/reviews'
  },
  {
    perms: [PERMISSIONS.BANNERS.MANAGE],
    route: '/admin/banners'
  },
  {
    perms: [PERMISSIONS.REWARDS.MANAGE],
    route: '/admin/rewards'
  },
  {
    perms: [PERMISSIONS.COUPONS.MANAGE],
    route: '/admin/coupons'
  },
  {
    perms: [PERMISSIONS.SETTINGS.VIEW_ANALYTICS],
    route: '/admin/analytics'
  },
  {
    perms: [PERMISSIONS.SYSTEM.MANAGE_ROLES],
    route: '/admin/settings/roles'
  },
  {
    perms: [PERMISSIONS.SYSTEM.MANAGE_USERS],
    route: '/admin/settings/users'
  },
  {
    perms: [PERMISSIONS.DASHBOARD.VIEW],
    route: '/admin/overview'
  }
]

import { PERMISSIONS } from './permissions'

export const PERMISSION_ROUTES: Record<string, string> = {
  [PERMISSIONS.VIEW_DASHBOARD]: '/admin/overview',
  [PERMISSIONS.MANAGE_ORDERS]: '/admin/orders',
  [PERMISSIONS.MANAGE_PRODUCTS]: '/admin/products',
  [PERMISSIONS.MANAGE_CATEGORIES]: '/admin/categories',
  [PERMISSIONS.MANAGE_CUSTOMERS]: '/admin/customers',
  [PERMISSIONS.MANAGE_BANNERS]: '/admin/banners',

  [PERMISSIONS.MANAGE_BLOG_POSTS]: '/admin/blog/posts',
  [PERMISSIONS.MANAGE_BLOG_CATEGORIES]: '/admin/blog/categories',
  [PERMISSIONS.MANAGE_BLOG_TAGS]: '/admin/blog/tags',

  [PERMISSIONS.MANAGE_PAYMENT]: '/admin/settings/payment',
  [PERMISSIONS.MANAGE_SHIPPING]: '/admin/settings/shipping',

  [PERMISSIONS.MANAGE_USERS]: '/admin/settings/users',
  [PERMISSIONS.MANAGE_ROLES]: '/admin/settings/roles',

  [PERMISSIONS.VIEW_ANALYTICS]: '/admin/overview'
}

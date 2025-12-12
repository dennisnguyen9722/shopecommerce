'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// ICONS
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  FolderTree,
  Image as ImageIcon,
  FileText,
  ChevronDown,
  ChevronLeft,
  TagsIcon,
  Menu,
  Settings,
  CreditCard,
  Truck,
  UserCircle,
  Gift,
  Star,
  BarChart3,
  Download,
  Building2
} from 'lucide-react'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip'

import { useAdminPermission } from '@/src/hooks/useAdminPermission'
import { useAdminAuthStore } from '@/src/store/adminAuthStore'
import { PERMISSIONS } from '@/src/constants/permissions'

export function Sidebar({
  onWidthChange
}: {
  onWidthChange?: (w: number) => void
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const admin = useAdminAuthStore((s) => s.admin)

  useEffect(() => {
    if (onWidthChange) onWidthChange(collapsed ? 80 : 260)
  }, [collapsed, onWidthChange])

  // Auto open accordion logic
  const autoOpenBlog = pathname.startsWith('/admin/blog')
  const autoOpenSettings = pathname.startsWith('/admin/settings')

  const [openGroup, setOpenGroup] = useState<string | null>(
    autoOpenBlog ? 'blog' : autoOpenSettings ? 'settings' : null
  )

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 1280)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Permissions
  const canDashboard = useAdminPermission(PERMISSIONS.DASHBOARD.VIEW)
  const canOrders = useAdminPermission(PERMISSIONS.ORDERS.READ)
  const canProducts = useAdminPermission(PERMISSIONS.PRODUCTS.READ)
  const canCategories = useAdminPermission(PERMISSIONS.CATEGORIES.READ)
  const canBrands = useAdminPermission(PERMISSIONS.BRANDS.READ) // ✅ NEW
  const canCustomers = useAdminPermission(PERMISSIONS.CUSTOMERS.READ)
  const canRewards = useAdminPermission(PERMISSIONS.REWARDS.MANAGE)
  const canBanners = useAdminPermission(PERMISSIONS.BANNERS.MANAGE)
  const canCoupons = useAdminPermission(PERMISSIONS.COUPONS.MANAGE)
  const canBlogRead = useAdminPermission(PERMISSIONS.BLOG.READ)
  const canPayment = useAdminPermission(PERMISSIONS.SETTINGS.MANAGE)
  const canShipping = useAdminPermission(PERMISSIONS.SETTINGS.MANAGE)
  const canUsers = useAdminPermission(PERMISSIONS.SYSTEM.MANAGE_USERS)
  const canRoles = useAdminPermission(PERMISSIONS.SYSTEM.MANAGE_ROLES)
  const canReviews = useAdminPermission(PERMISSIONS.REVIEWS.READ)
  const canAnalytics = useAdminPermission(PERMISSIONS.SETTINGS.VIEW_ANALYTICS)
  const canExport = useAdminPermission(PERMISSIONS.SETTINGS.EXPORT_DATA)

  return (
    <TooltipProvider delayDuration={80}>
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className={cn(
          'h-screen flex flex-col',
          'bg-sidebar border-r border-sidebar-border relative z-20 shadow-xl'
        )}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && (
            <h2 className="text-xl font-bold text-sidebar-foreground">
              Admin Panel
            </h2>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-sidebar-accent text-sidebar-foreground rounded-lg transition"
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {canDashboard && (
            <NavItem
              href="/admin/overview"
              icon={LayoutDashboard}
              label="Tổng quan"
              active={pathname === '/admin/overview'}
              collapsed={collapsed}
            />
          )}

          {/* Analytics */}
          {canAnalytics && (
            <NavItem
              href="/admin/analytics"
              icon={BarChart3}
              label="Analytics"
              active={pathname.startsWith('/admin/analytics')}
              collapsed={collapsed}
            />
          )}

          {/* Xuất dữ liệu */}
          {canExport && (
            <NavItem
              href="/admin/export"
              icon={Download}
              label="Xuất dữ liệu"
              active={pathname.startsWith('/admin/export')}
              collapsed={collapsed}
            />
          )}

          {canOrders && (
            <NavItem
              href="/admin/orders"
              icon={ShoppingBag}
              label="Đơn hàng"
              active={pathname.startsWith('/admin/orders')}
              collapsed={collapsed}
            />
          )}

          {canProducts && (
            <NavItem
              href="/admin/products"
              icon={Package}
              label="Sản phẩm"
              active={pathname.startsWith('/admin/products')}
              collapsed={collapsed}
            />
          )}

          {canCategories && (
            <NavItem
              href="/admin/categories"
              icon={FolderTree}
              label="Danh mục SP"
              active={pathname.startsWith('/admin/categories')}
              collapsed={collapsed}
            />
          )}

          {/* ✅ NEW: Thương hiệu */}
          {canBrands && (
            <NavItem
              href="/admin/brands"
              icon={Building2}
              label="Thương hiệu"
              active={pathname.startsWith('/admin/brands')}
              collapsed={collapsed}
            />
          )}

          {canCustomers && (
            <NavItem
              href="/admin/customers"
              icon={Users}
              label="Khách hàng"
              active={pathname.startsWith('/admin/customers')}
              collapsed={collapsed}
            />
          )}

          {canReviews && (
            <NavItem
              href="/admin/reviews"
              icon={Star}
              label="Đánh giá SP"
              active={pathname.startsWith('/admin/reviews')}
              collapsed={collapsed}
            />
          )}

          {canRewards && (
            <NavItem
              href="/admin/rewards"
              icon={Gift}
              label="Đổi quà & Voucher"
              active={pathname.startsWith('/admin/rewards')}
              collapsed={collapsed}
            />
          )}

          {canCoupons && (
            <NavItem
              href="/admin/coupons"
              icon={TagsIcon}
              label="Mã giảm giá"
              active={pathname.startsWith('/admin/coupons')}
              collapsed={collapsed}
            />
          )}

          {canBanners && (
            <NavItem
              href="/admin/banners"
              icon={ImageIcon}
              label="Banner / Slider"
              active={pathname.startsWith('/admin/banners')}
              collapsed={collapsed}
            />
          )}

          {canBlogRead && (
            <AccordionGroup
              id="blog"
              label="Blog / Tin tức"
              icon={FileText}
              active={pathname.startsWith('/admin/blog')}
              collapsed={collapsed}
              openGroup={openGroup}
              setOpenGroup={setOpenGroup}
            >
              <SubItem
                href="/admin/blog/posts"
                label="Bài viết"
                icon={FileText}
                active={pathname.startsWith('/admin/blog/posts')}
                collapsed={collapsed}
              />
              <SubItem
                href="/admin/blog/categories"
                label="Danh mục bài viết"
                icon={FolderTree}
                active={pathname.startsWith('/admin/blog/categories')}
                collapsed={collapsed}
              />
              <SubItem
                href="/admin/blog/tags"
                label="Tags"
                icon={TagsIcon}
                active={pathname.startsWith('/admin/blog/tags')}
                collapsed={collapsed}
              />
            </AccordionGroup>
          )}

          {(canPayment || canShipping || canUsers || canRoles) && (
            <AccordionGroup
              id="settings"
              label="Cài đặt"
              icon={Settings}
              active={pathname.startsWith('/admin/settings')}
              collapsed={collapsed}
              openGroup={openGroup}
              setOpenGroup={setOpenGroup}
            >
              {canPayment && (
                <SubItem
                  href="/admin/settings/payment"
                  label="Thanh toán"
                  icon={CreditCard}
                  active={pathname.startsWith('/admin/settings/payment')}
                  collapsed={collapsed}
                />
              )}
              {canShipping && (
                <SubItem
                  href="/admin/settings/shipping"
                  label="Vận chuyển"
                  icon={Truck}
                  active={pathname.startsWith('/admin/settings/shipping')}
                  collapsed={collapsed}
                />
              )}
              {canUsers && (
                <SubItem
                  href="/admin/settings/users"
                  label="Tài khoản"
                  icon={Users}
                  active={pathname.startsWith('/admin/settings/users')}
                  collapsed={collapsed}
                />
              )}
              {canRoles && (
                <SubItem
                  href="/admin/settings/roles"
                  label="Phân quyền"
                  icon={Settings}
                  active={pathname.startsWith('/admin/settings/roles')}
                  collapsed={collapsed}
                />
              )}
            </AccordionGroup>
          )}
        </nav>

        {/* PROFILE */}
        <NavItem
          href="/admin/profile"
          icon={UserCircle}
          label="Hồ sơ của tôi"
          active={pathname === '/admin/profile'}
          collapsed={collapsed}
        />

        {/* BOTTOM AVATAR */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-sidebar-border flex items-center gap-3"
        >
          {admin?.avatar ? (
            <img
              src={admin.avatar}
              alt={admin.name}
              className="w-10 h-10 rounded-full object-cover border border-sidebar-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground">
              <Users className="w-6 h-6" />
            </div>
          )}

          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground truncate max-w-[150px]">
                {admin?.name || 'Administrator'}
              </span>
              <span className="text-xs text-muted-foreground">
                {admin?.email || 'System'}
              </span>
            </div>
          )}
        </motion.div>
      </motion.aside>
    </TooltipProvider>
  )
}

// === CÁC COMPONENT CON ===

function NavItem({ href, label, icon: Icon, active, collapsed }: any) {
  const Component = (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-3 p-3 rounded-lg transition-all group overflow-hidden',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      )}
    >
      {active && (
        <motion.div
          layoutId="neon-active"
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-md bg-sidebar-primary"
        />
      )}

      <Icon
        className={cn(
          'w-5 h-5 flex-shrink-0',
          active ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'
        )}
      />

      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </Link>
  )

  if (collapsed)
    return (
      <Tooltip>
        <TooltipTrigger asChild>{Component}</TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-sidebar text-sidebar-foreground border-sidebar-border"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    )

  return Component
}

function AccordionGroup({
  id,
  icon: Icon,
  label,
  active,
  openGroup,
  setOpenGroup,
  collapsed,
  children
}: any) {
  const isOpen = openGroup === id

  const Header = (
    <button
      onClick={() => setOpenGroup(isOpen ? null : id)}
      className={cn(
        'relative flex items-center justify-between p-3 rounded-lg w-full transition-all',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      )}
    >
      {active && (
        <motion.div
          layoutId="neon-active"
          className="absolute left-0 top-2 bottom-2 w-[3px] bg-sidebar-primary"
        />
      )}

      <span className="flex items-center gap-3">
        <Icon
          className={cn(
            'w-5 h-5 flex-shrink-0',
            active ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'
          )}
        />
        {!collapsed && <span className="whitespace-nowrap">{label}</span>}
      </span>

      {!collapsed && (
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      )}
    </button>
  )

  return (
    <div>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{Header}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-sidebar text-sidebar-foreground border-sidebar-border"
          >
            {label}
          </TooltipContent>
        </Tooltip>
      ) : (
        Header
      )}

      <AnimatePresence initial={false}>
        {isOpen && !collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-4 pl-4 mt-1 flex flex-col gap-1 border-l border-sidebar-border/50"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SubItem({ href, label, icon: Icon, active, collapsed }: any) {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all group',
        active
          ? 'text-sidebar-primary font-medium bg-sidebar-accent/50'
          : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4 flex-shrink-0',
          active ? 'text-sidebar-primary' : 'text-muted-foreground'
        )}
      />
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </Link>
  )
}

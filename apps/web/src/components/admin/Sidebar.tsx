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
  Gift
} from 'lucide-react'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip'

// 👇 IMPORT MỚI: Store & Constants
import { useAdminPermission } from '@/src/hooks/useAdminPermission'
import { useAdminAuthStore } from '@/src/store/adminAuthStore'
import { PERMISSIONS } from '@/src/constants/permissions' // 👈 Import bộ từ điển quyền chuẩn

export function Sidebar({
  onWidthChange
}: {
  onWidthChange?: (w: number) => void
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Lấy thông tin Admin để hiển thị Avatar
  const admin = useAdminAuthStore((s) => s.admin)

  // Notify parent layout when width changes
  useEffect(() => {
    if (onWidthChange) onWidthChange(collapsed ? 80 : 260)
  }, [collapsed])

  // Auto open accordion logic
  const autoOpenBlog = pathname.startsWith('/admin/blog')
  const autoOpenSettings = pathname.startsWith('/admin/settings')

  const [openGroup, setOpenGroup] = useState<string | null>(
    autoOpenBlog ? 'blog' : autoOpenSettings ? 'settings' : null
  )

  // Auto collapse for small screens
  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 1280)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // =========================================================================
  // ⭐ CHECK PERMISSIONS (DÙNG CONSTANT CHUẨN)
  // =========================================================================

  // 1. Dashboard: Dùng .VIEW
  const canDashboard = useAdminPermission(PERMISSIONS.DASHBOARD.VIEW)

  // 2. Core Features: Chỉ cần quyền READ là thấy menu
  const canOrders = useAdminPermission(PERMISSIONS.ORDERS.READ)
  const canProducts = useAdminPermission(PERMISSIONS.PRODUCTS.READ)
  const canCategories = useAdminPermission(PERMISSIONS.CATEGORIES.READ)
  const canCustomers = useAdminPermission(PERMISSIONS.CUSTOMERS.READ)

  // 3. Loyalty & Marketing
  const canRewards = useAdminPermission(PERMISSIONS.REWARDS.MANAGE)
  const canBanners = useAdminPermission(PERMISSIONS.BANNERS.MANAGE)

  const canCoupons = useAdminPermission(PERMISSIONS.COUPONS.MANAGE)

  // 4. Blog: Check quyền READ chung
  const canBlogRead = useAdminPermission(PERMISSIONS.BLOG.READ)

  // 5. Settings & System
  const canPayment = useAdminPermission(PERMISSIONS.SETTINGS.MANAGE) // Hoặc tách nhỏ nếu muốn
  const canShipping = useAdminPermission(PERMISSIONS.SETTINGS.MANAGE)
  const canUsers = useAdminPermission(PERMISSIONS.SYSTEM.MANAGE_USERS)
  const canRoles = useAdminPermission(PERMISSIONS.SYSTEM.MANAGE_ROLES)

  return (
    <TooltipProvider delayDuration={80}>
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className={cn(
          'h-screen border-r border-white/30 dark:border-white/10 flex flex-col',
          'backdrop-blur-xl bg-white/70 dark:bg-black/30 shadow-none relative z-20'
        )}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          {!collapsed && (
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Admin Panel
            </h2>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-white/40 dark:hover:bg-white/10 rounded-lg transition"
          >
            {collapsed ? <Menu /> : <ChevronLeft />}
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {/* DASHBOARD - Luôn hiển thị nếu có quyền view hoặc fallback */}
          <NavItem
            href="/admin/overview"
            icon={LayoutDashboard}
            label="Tổng quan"
            active={pathname === '/admin/overview'}
            collapsed={collapsed}
          />

          {/* ORDERS */}
          {canOrders && (
            <NavItem
              href="/admin/orders"
              icon={ShoppingBag}
              label="Đơn hàng"
              active={pathname.startsWith('/admin/orders')}
              collapsed={collapsed}
            />
          )}

          {/* PRODUCTS */}
          {canProducts && (
            <NavItem
              href="/admin/products"
              icon={Package}
              label="Sản phẩm"
              active={pathname.startsWith('/admin/products')}
              collapsed={collapsed}
            />
          )}

          {/* CATEGORIES */}
          {canCategories && (
            <NavItem
              href="/admin/categories"
              icon={FolderTree}
              label="Danh mục sản phẩm"
              active={pathname.startsWith('/admin/categories')}
              collapsed={collapsed}
            />
          )}

          {/* CUSTOMERS */}
          {canCustomers && (
            <NavItem
              href="/admin/customers"
              icon={Users}
              label="Khách hàng"
              active={pathname.startsWith('/admin/customers')}
              collapsed={collapsed}
            />
          )}

          {/* REWARDS (LOYALTY) */}
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

          {/* BANNERS */}
          {canBanners && (
            <NavItem
              href="/admin/banners"
              icon={ImageIcon}
              label="Banner / Slider"
              active={pathname.startsWith('/admin/banners')}
              collapsed={collapsed}
            />
          )}

          {/* BLOG GROUP */}
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

          {/* SETTINGS GROUP */}
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
                  label="Phương thức thanh toán"
                  icon={CreditCard}
                  active={pathname.startsWith('/admin/settings/payment')}
                  collapsed={collapsed}
                />
              )}

              {canShipping && (
                <SubItem
                  href="/admin/settings/shipping"
                  label="Phí vận chuyển"
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
                  label="Phân quyền (Roles)"
                  icon={Settings}
                  active={pathname.startsWith('/admin/settings/roles')}
                  collapsed={collapsed}
                />
              )}
            </AccordionGroup>
          )}
        </nav>

        {/* PROFILE - Luôn hiển thị */}
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
          className="p-4 border-t border-white/20 flex items-center gap-3"
        >
          {admin?.avatar ? (
            <img
              src={admin.avatar}
              alt={admin.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
              <Users className="w-6 h-6" />
            </div>
          )}

          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold truncate max-w-[150px]">
                {admin?.name || 'Administrator'}
              </span>
              <span className="text-xs text-gray-500">
                {admin?.email || 'System'}
              </span>
            </div>
          )}
        </motion.div>
      </motion.aside>
    </TooltipProvider>
  )
}

/* ===================== CÁC COMPONENT CON (GIỮ NGUYÊN) ===================== */

function NavItem({ href, label, icon: Icon, active, collapsed }: any) {
  const Component = (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-3 p-3 rounded-lg transition-all group overflow-hidden',
        active
          ? 'bg-white/70 dark:bg-white/10 shadow-inner'
          : 'hover:bg-white/40 dark:hover:bg-white/10'
      )}
    >
      {active && (
        <motion.div
          layoutId="neon-active"
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-md bg-gradient-to-b from-blue-500 to-purple-500"
        />
      )}

      <Icon
        className={cn(
          'w-5 h-5 flex-shrink-0',
          active ? 'text-gray-900 dark:text-white' : 'text-gray-500'
        )}
      />

      {!collapsed && (
        <span className="font-medium whitespace-nowrap">{label}</span>
      )}
    </Link>
  )

  if (collapsed)
    return (
      <Tooltip>
        <TooltipTrigger asChild>{Component}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
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
        'relative flex items-center justify-between p-3 rounded-lg w-full',
        active
          ? 'bg-white/70 dark:bg-white/10 shadow-inner'
          : 'hover:bg-white/40 dark:hover:bg-white/10'
      )}
    >
      {active && (
        <motion.div
          layoutId="neon-active"
          className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-blue-500 to-purple-500"
        />
      )}

      <span className="flex items-center gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-300" />
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
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      ) : (
        Header
      )}

      <AnimatePresence initial={false}>
        {isOpen && !collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0, x: -10 }}
            animate={{ opacity: 1, height: 'auto', x: 0 }}
            exit={{ opacity: 0, height: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="ml-8 mt-1 flex flex-col gap-1 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SubItem({ href, label, icon: Icon, active, collapsed }: any) {
  const Component = (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all group',
        active
          ? 'bg-white/70 dark:bg-white/10 shadow-inner'
          : 'hover:bg-white/40 dark:hover:bg-white/10'
      )}
    >
      {active && (
        <motion.div
          layoutId="sub-active"
          className="absolute left-0 top-1 bottom-1 w-[2px] bg-gradient-to-b from-purple-400 to-blue-400"
        />
      )}

      <Icon
        className={cn(
          'w-4 h-4 flex-shrink-0',
          active
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-400 group-hover:text-gray-700'
        )}
      />

      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </Link>
  )

  if (collapsed)
    return (
      <Tooltip>
        <TooltipTrigger asChild>{Component}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )

  return Component
}

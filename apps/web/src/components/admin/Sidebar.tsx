'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
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
  CircleUser
} from 'lucide-react'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip'

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Auto open Blog group
  const autoOpenBlog = pathname.startsWith('/admin/blog')
  const [openGroup, setOpenGroup] = useState<string | null>(
    autoOpenBlog ? 'blog' : null
  )

  // Auto collapse for small screens
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 1280)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem
            href="/admin/overview"
            icon={LayoutDashboard}
            label="Tổng quan"
            active={pathname === '/admin/overview'}
            collapsed={collapsed}
          />

          <NavItem
            href="/admin/orders"
            icon={ShoppingBag}
            label="Đơn hàng"
            active={pathname.startsWith('/admin/orders')}
            collapsed={collapsed}
          />

          <NavItem
            href="/admin/products"
            icon={Package}
            label="Sản phẩm"
            active={pathname.startsWith('/admin/products')}
            collapsed={collapsed}
          />

          <NavItem
            href="/admin/categories"
            icon={FolderTree}
            label="Danh mục sản phẩm"
            active={pathname.startsWith('/admin/categories')}
            collapsed={collapsed}
          />

          <NavItem
            href="/admin/customers"
            icon={Users}
            label="Khách hàng"
            active={pathname.startsWith('/admin/customers')}
            collapsed={collapsed}
          />

          <NavItem
            href="/admin/banners"
            icon={ImageIcon}
            label="Banner / Slider"
            active={pathname.startsWith('/admin/banners')}
            collapsed={collapsed}
          />

          {/* BLOG GROUP */}
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
        </nav>

        {/* BOTTOM AVATAR */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-white/20 flex items-center gap-3"
        >
          <div className="relative">
            <CircleUser className="w-10 h-10 text-gray-700 dark:text-gray-200" />

            {/* Glow behind avatar */}
            <div className="absolute inset-0 blur-xl rounded-full bg-gradient-to-r from-purple-400/30 to-blue-400/30 -z-10"></div>
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Dennis</span>
              <span className="text-xs text-gray-500">Administrator</span>
            </div>
          )}
        </motion.div>
      </motion.aside>
    </TooltipProvider>
  )
}

/*-------------------------------------------------------*
 | MAIN ITEM (NEON + MOTION)
 *-------------------------------------------------------*/
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
      {/* Neon Active Bar */}
      {active && (
        <motion.div
          layoutId="neon-active"
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-md bg-gradient-to-b from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(109,40,217,0.5)]"
        />
      )}

      <Icon
        className={cn(
          'w-5 h-5 transition',
          active
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-500 dark:text-gray-300 group-hover:text-black'
        )}
      />

      {!collapsed && <span className="font-medium">{label}</span>}
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

/*-------------------------------------------------------*
 | ACCORDION GROUP
 *-------------------------------------------------------*/
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
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-md bg-gradient-to-b from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(109,40,217,0.5)]"
        />
      )}

      <span className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
        {!collapsed && label}
      </span>

      {!collapsed && (
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
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
            className="ml-8 mt-1 flex flex-col gap-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/*-------------------------------------------------------*
 | SUB ITEM
 *-------------------------------------------------------*/
function SubItem({ href, label, icon: Icon, active, collapsed }: any) {
  const component = (
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
          className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r-md bg-gradient-to-b from-purple-400 to-blue-400"
        />
      )}

      <Icon
        className={cn(
          'w-4 h-4 transition',
          active
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-400 group-hover:text-gray-700 dark:text-gray-300'
        )}
      />

      {!collapsed && label}
    </Link>
  )

  if (collapsed)
    return (
      <Tooltip>
        <TooltipTrigger asChild>{component}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )

  return component
}

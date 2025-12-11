/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/store/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  User,
  Package,
  MapPin,
  Gift,
  LogOut,
  ChevronRight,
  Edit2
} from 'lucide-react'

// Menu Item Component
const NavItem = ({ href, icon: Icon, label }: any) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center justify-between p-3 rounded-lg transition-all group ${
        isActive
          ? 'bg-orange-50 text-orange-600 border border-orange-100 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={18}
          className={
            isActive
              ? 'text-orange-600'
              : 'text-gray-400 group-hover:text-gray-600'
          }
        />
        <span>{label}</span>
      </div>
      {isActive && <ChevronRight size={16} />}
    </Link>
  )
}

export default function ProfileLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted || !user) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Mobile Greeting */}
        <div className="mb-6 md:hidden">
          <h1 className="text-2xl font-bold text-gray-900">
            Xin chào, {user.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ================= SIDEBAR (CỐ ĐỊNH) ================= */}
          <div className="lg:col-span-3 space-y-6">
            {/* User Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-4">
                <Avatar className="w-full h-full border-4 border-orange-50">
                  <AvatarImage
                    src={user.avatar || ''}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="font-bold text-lg text-gray-900 truncate w-full">
                {user.name}
              </h2>
              <p className="text-sm text-gray-500 mb-4 truncate w-full">
                {user.email}
              </p>

              {/* Loyalty Badge */}
              <div className="w-full bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                <div className="flex justify-between items-center text-xs font-semibold text-orange-800 uppercase tracking-wider mb-1">
                  <span>{user.loyaltyTier || 'Member'}</span>
                  <Gift size={14} />
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {user.loyaltyPoints?.toLocaleString() ?? 0}{' '}
                  <span className="text-xs font-medium text-orange-500">
                    điểm
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-1 hidden lg:block">
              <NavItem
                href="/profile"
                icon={User}
                label="Thông tin tài khoản"
              />
              <NavItem
                href="/profile/orders"
                icon={Package}
                label="Đơn hàng của tôi"
              />
              <NavItem
                href="/profile/addresses"
                icon={MapPin}
                label="Sổ địa chỉ"
              />
              <NavItem
                href="/profile/coupons"
                icon={Gift}
                label="Kho Voucher"
              />

              <Separator className="my-2" />

              <button
                onClick={() => {
                  logout()
                  router.push('/')
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* ================= CONTENT (THAY ĐỔI) ================= */}
          <div className="lg:col-span-9 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

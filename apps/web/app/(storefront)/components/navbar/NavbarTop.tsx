/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import {
  Search,
  ShoppingCart,
  Heart,
  LogOut,
  Gift,
  User,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { useWishlist } from '@/app/contexts/WishlistContext'
import { useCart } from '@/app/contexts/CartContext'
import { useAuthStore } from '@/src/store/authStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { loyaltyApi } from '@/src/services/loyalty'

interface NavbarTopProps {
  scrolled: boolean
}

export default function NavbarTop({ scrolled }: NavbarTopProps) {
  const { wishlistCount } = useWishlist()
  const { cartCount } = useCart()
  const { user, isAuthenticated, logout, updateUser, token } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Sync Loyalty Data
  useEffect(() => {
    const syncLoyaltyData = async () => {
      if (isAuthenticated && token) {
        try {
          const data = await loyaltyApi.getDashboard()
          if (data && data.customer) {
            updateUser({
              loyaltyPoints: data.customer.loyaltyPoints,
              loyaltyTier: data.customer.loyaltyTier,
              totalSpent: data.customer.totalSpent
            })
          }
        } catch (error) {
          console.error('Lỗi đồng bộ điểm:', error)
        }
      }
    }
    syncLoyaltyData()
  }, [isAuthenticated, token, updateUser])

  return (
    <div
      className={`
        w-full transition-all duration-300 border-b border-gray-100! bg-white! sticky top-0 z-50
        ${scrolled ? 'bg-white!/95 backdrop-blur-sm py-2' : 'bg-white! py-4'}
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* 1. LOGO BRANDING */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-11 h-11 flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <span className="text-2xl">🎁</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-gray-900! leading-tight tracking-tight">
                Dennis<span className="text-orange-600">Shop</span>
              </span>
              <span className="text-[9px] font-semibold text-gray-400! uppercase tracking-widest">
                Premium Store
              </span>
            </div>
          </Link>

          {/* 2. SEARCH BAR (Modern & Wide) */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Bạn muốn tìm gì hôm nay?..."
                className="w-full pl-5 pr-14 py-3 bg-gray-50! text-gray-900! border border-gray-200! focus:bg-white! focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-full outline-none transition-all duration-300 text-sm placeholder:text-gray-400!"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3. RIGHT ACTIONS */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Wishlist */}
            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-red-100! hover:text-red-600 transition-all rounded-full text-gray-700! bg-orange-50! border border-orange-100!"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full ring-2 ring-white shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-orange-100! hover:text-orange-600 transition-all rounded-full text-gray-700! bg-orange-50! border border-orange-100!"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-xs font-bold flex items-center justify-center rounded-full ring-2 ring-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

            {/* User Dropdown */}
            {mounted && isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="pl-2 pr-3 h-auto py-1.5 rounded-full bg-white! hover:bg-gray-50! border border-gray-200! hover:border-gray-300! gap-2 transition-all"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start text-xs mr-1">
                      <span className="font-bold text-gray-800! max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <span className="text-orange-600 font-semibold text-[11px]">
                        {user.loyaltyPoints?.toLocaleString() ?? 0} điểm
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-64 p-0 rounded-2xl shadow-2xl border border-gray-100! bg-white! z-[9999]"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="p-0">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 border-b border-gray-100! rounded-t-2xl">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white font-bold text-lg">
                          {user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-800!">
                          {user.name}
                        </span>
                        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full w-fit mt-1">
                          {user.loyaltyTier || 'MEMBER'}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <div className="p-2 bg-white!">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="cursor-pointer gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50! text-gray-700!"
                      >
                        <User size={18} className="text-gray-400!" />
                        <span className="font-medium text-gray-700!">
                          Hồ sơ cá nhân
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/loyalty"
                        className="cursor-pointer gap-3 py-2.5 px-3 rounded-lg hover:bg-indigo-50! text-indigo-600!"
                      >
                        <Gift size={18} className="text-indigo-400!" />
                        <span className="font-medium text-indigo-600!">
                          Điểm & Đổi quà
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/tracking"
                        className="cursor-pointer gap-3 py-2.5 px-3 rounded-lg hover:bg-blue-50! text-gray-700!"
                      >
                        <Package size={18} className="text-blue-400!" />
                        <span className="font-medium text-gray-700!">
                          Theo dõi đơn hàng
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-2 bg-gray-200!" />

                    <DropdownMenuItem
                      onClick={logout}
                      className="text-red-600! focus:bg-red-50! focus:text-red-700! cursor-pointer gap-3 py-2.5 px-3 font-medium rounded-lg hover:bg-red-50!"
                    >
                      <LogOut size={18} /> Đăng xuất
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden md:block text-sm font-semibold text-gray-600! hover:text-orange-600 transition-colors px-3"
                >
                  Đăng nhập
                </Link>
                <Link href="/register">
                  <Button className="rounded-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-orange-600 hover:to-red-600 text-white hover:shadow-lg transition-all duration-300 font-semibold px-5 h-9 text-sm">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

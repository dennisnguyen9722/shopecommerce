/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { Search, MapPin, ShoppingCart, Heart, LogOut, Gift } from 'lucide-react'
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
import { loyaltyApi } from '@/src/services/loyalty' // 👈 Import API Loyalty

interface NavbarTopProps {
  scrolled: boolean
}

export default function NavbarTop({ scrolled }: NavbarTopProps) {
  const { wishlistCount } = useWishlist()
  const { cartCount } = useCart()

  // Lấy state và hàm update từ store
  const { user, isAuthenticated, logout, updateUser, token } = useAuthStore()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // ⭐ UPDATE LOGIC ĐỒNG BỘ ĐIỂM
  useEffect(() => {
    const syncLoyaltyData = async () => {
      // 🛑 QUAN TRỌNG: Chỉ gọi khi CÓ TOKEN thực sự (tránh gọi lúc vừa login xong store chưa kịp lưu)
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
        } catch (error: any) {
          // Chỉ log lỗi, KHÔNG logout tự động ở đây để tránh loop nếu mạng lag
          console.error('Lỗi đồng bộ điểm thưởng:', error)
        }
      }
    }

    // Thêm token vào dependency để khi token thay đổi (vừa login xong) nó sẽ chạy lại
    syncLoyaltyData()
  }, [isAuthenticated, token])

  return (
    <div
      className={`
        w-full backdrop-blur-xl bg-white/80 border-b border-gray-200/50
        transition-all duration-300 shadow-sm
        ${scrolled ? 'py-2 shadow-lg' : 'py-3'}
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-6">
          {/* LEFT LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition" />
              <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-3 shadow-lg">
                <span className="text-white font-bold text-xl">🌐</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎁</span>
              <div className="flex flex-col text-xs leading-tight">
                <span className="font-semibold text-gray-800">Shop</span>
                <span className="font-semibold text-gray-600">Loyalty</span>
              </div>
            </div>
          </Link>

          {/* CENTER - SEARCH */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="flex-1 relative group">
              <div className="relative backdrop-blur-md bg-white/60 border border-gray-200/50 rounded-2xl shadow-sm hover:shadow-md transition">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full px-5 py-3 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-sm"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:shadow-md transition">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT - ACTIONS */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
              <Heart className="w-6 h-6 text-gray-700 hover:text-red-500 transition" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-orange-600 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* USER / LOGIN SECTION */}
            {mounted && isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-gray-200 hover:shadow-md transition"
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 p-2"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1 bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-bold text-gray-900 leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-gray-500">
                        {user.email}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full uppercase border border-yellow-200">
                          {user.loyaltyTier || 'Member'}
                        </span>
                        {/* HIỂN THỊ ĐIỂM */}
                        <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                          {/* Dùng toán tử ?? để tránh hiện undefined */}
                          {user.loyaltyPoints?.toLocaleString() ?? 0} điểm
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer focus:bg-orange-50"
                  >
                    <Link
                      href="/loyalty"
                      className="flex items-center gap-2 py-2"
                    >
                      <div className="p-1 bg-indigo-100 text-indigo-600 rounded">
                        <Gift size={16} />
                      </div>
                      <span className="font-medium">Điểm & Đổi quà</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer focus:bg-orange-50"
                  >
                    <Link
                      href="/tracking"
                      className="flex items-center gap-2 py-2"
                    >
                      <div className="p-1 bg-blue-100 text-blue-600 rounded">
                        <MapPin size={16} />
                      </div>
                      <span className="font-medium">Theo dõi đơn hàng</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 cursor-pointer focus:bg-red-50 py-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md"
                  >
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

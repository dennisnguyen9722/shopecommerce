/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import {
  Search,
  ShoppingCart,
  Heart,
  LogOut,
  Gift,
  User,
  Package,
  Loader2,
  X
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
import { useEffect, useState, useRef } from 'react'
import { loyaltyApi } from '@/src/services/loyalty'
import serverApi from '@/src/lib/serverApi'

interface NavbarTopProps {
  scrolled: boolean
}

export default function NavbarTop({ scrolled }: NavbarTopProps) {
  const { wishlistCount } = useWishlist()
  const { cartCount } = useCart()
  const { user, isAuthenticated, logout, updateUser, token } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  // 🔥 REALTIME SEARCH STATES
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimer = useRef<any>(null)

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

  // 🔥 REALTIME SEARCH với Debounce
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)

    if (!searchText.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)

    searchTimer.current = setTimeout(async () => {
      try {
        const { data } = await serverApi.get('/public/products/search', {
          params: { query: searchText }
        })
        setSearchResults(data || [])
        setShowResults(true)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current)
      }
    }
  }, [searchText])

  // Click outside to close
  useEffect(() => {
    const handler = (e: any) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Clear search
  const clearSearch = () => {
    setSearchText('')
    setSearchResults([])
    setShowResults(false)
  }

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

          {/* 2. SEARCH BAR - REALTIME SEARCH */}
          <div
            className="hidden md:flex flex-1 max-w-2xl relative"
            ref={searchRef}
          >
            <div className="relative w-full group">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => searchText && setShowResults(true)}
                placeholder="Bạn muốn tìm gì hôm nay?..."
                className="w-full pl-5 pr-14 py-3 bg-gray-50! text-gray-900! border border-gray-200! focus:bg-white! focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-full outline-none transition-all duration-300 text-sm placeholder:text-gray-400!"
              />

              {/* Clear button */}
              {searchText && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-12 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>

              {/* 🔥 DROPDOWN RESULTS */}
              {showResults && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden max-h-[500px] overflow-y-auto">
                  {isSearching && (
                    <div className="p-8 flex items-center justify-center text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm">Đang tìm kiếm...</span>
                    </div>
                  )}

                  {!isSearching && searchResults.length === 0 && (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium mb-1">
                        Không tìm thấy sản phẩm
                      </p>
                      <p className="text-sm text-gray-400">
                        Thử tìm kiếm với từ khóa khác
                      </p>
                    </div>
                  )}

                  {!isSearching && searchResults.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {searchResults.length} kết quả
                        </span>
                      </div>
                      {searchResults.map((p: any) => (
                        <Link
                          key={p._id}
                          href={`/products/${p.slug}`}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                          onClick={() => {
                            setShowResults(false)
                            setSearchText('')
                            setSearchResults([])
                          }}
                        >
                          <img
                            src={p.images?.[0]?.url ?? '/placeholder.png'}
                            alt={p.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-100 group-hover:border-orange-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate group-hover:text-orange-600">
                              {p.name}
                            </h4>
                            {p.category && (
                              <p className="text-xs text-gray-500 mb-1">
                                {typeof p.category === 'string'
                                  ? p.category
                                  : p.category.name}
                              </p>
                            )}
                            <p className="text-orange-600 font-bold text-sm">
                              {p.price?.toLocaleString('vi-VN')}₫
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

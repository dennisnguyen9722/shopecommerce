'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/store/authStore'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import NotificationBell from './NotificationBell'

export function Header() {
  const router = useRouter()

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    toast.success('Đã đăng xuất!')
    router.push('/admin/login')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        'backdrop-blur-xl bg-white/60 dark:bg-black/20',
        'border-b border-white/20 dark:border-white/10',
        'h-14 flex items-center px-6',
        'shadow-sm'
      )}
    >
      <div className="flex items-center justify-end w-full gap-4">
        {/* ⭐ THAY THẾ BUTTON CŨ BẰNG COMPONENT MỚI */}
        <NotificationBell />

        {/* User Avatar + Info */}
        <div className="flex items-center gap-3">
          <Image
            src={user?.avatar || '/avatar.webp'}
            alt="avatar"
            width={32}
            height={32}
            className="rounded-full border border-white/40 shadow-sm object-cover"
          />

          <div className="text-sm leading-tight hidden md:block">
            <div className="font-semibold">{user?.name || 'Admin'}</div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-200 hover:opacity-60 transition"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}

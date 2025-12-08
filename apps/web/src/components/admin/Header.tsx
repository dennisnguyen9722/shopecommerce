'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAdminAuthStore } from '@/src/store/adminAuthStore'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import NotificationBell from './NotificationBell'
import { ThemeToggle } from '@/src/components/ThemeToggle'

export function Header() {
  const router = useRouter()
  const admin = useAdminAuthStore((s) => s.admin)
  const logoutAdmin = useAdminAuthStore((s) => s.logoutAdmin)

  const handleLogout = () => {
    logoutAdmin()
    toast.success('Đã đăng xuất Admin!')
    router.push('/admin/login')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        // 👇 SỬA Ở ĐÂY: Dùng background/80 thay vì white/black để tự động theo theme
        'backdrop-blur-xl bg-background/80',
        'border-b border-border', // Dùng border-border tự động đổi màu
        'h-14 flex items-center px-6',
        'shadow-sm'
      )}
    >
      <div className="flex items-center justify-end w-full gap-4">
        <ThemeToggle />
        <NotificationBell />

        <div className="flex items-center gap-3">
          <Image
            src={admin?.avatar || '/avatar.webp'}
            alt="avatar"
            width={32}
            height={32}
            className="rounded-full border border-border shadow-sm object-cover"
          />

          <div className="text-sm leading-tight hidden md:block">
            {/* 👇 SỬA Ở ĐÂY: Dùng text-foreground và text-muted-foreground */}
            <div className="font-semibold text-foreground">
              {admin?.name || 'Administrator'}
            </div>
            <div className="text-xs text-muted-foreground">{admin?.email}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          // 👇 SỬA Ở ĐÂY: Dùng text-muted-foreground hover sang foreground
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}

'use client'

import { useEffect, useState, startTransition } from 'react'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import api from '@/src/lib/api'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/admin/notifications')

      // dùng startTransition để tránh lỗi setState trong effect
      startTransition(() => {
        setNotifications(data.items || [])
        setUnreadCount(data.unread || 0)
      })
    } catch (err) {
      console.error('Notification fetch error:', err)
    }
  }

  useEffect(() => {
    let mounted = true

    const load = async () => {
      if (!mounted) return
      await fetchNotifications()
    }

    load()

    const timer = setInterval(() => {
      if (mounted) fetchNotifications()
    }, 10000)

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/admin/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) {
      console.error('Mark as read error:', err)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative outline-none">
        <Bell className="h-6 w-6 cursor-pointer text-gray-600" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1 text-xs">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-0">
        <div className="p-4 font-semibold border-b">Thông báo</div>

        <div className="max-h-80 overflow-auto">
          {notifications.length === 0 && (
            <div className="p-4 text-sm text-gray-500">Không có thông báo</div>
          )}

          {notifications.map((n) => (
            <DropdownMenuItem
              key={n._id || n.id}
              className="flex flex-col items-start space-y-1 cursor-pointer"
              onClick={() => markAsRead(n._id)}
            >
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-gray-500">{n.timeAgo}</div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

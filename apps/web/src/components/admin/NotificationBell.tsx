/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { Bell, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent
} from '@/components/ui/dropdown-menu'
import useRealtimeNotifications from '@/src/hooks/useRealtimeNotifications'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type Notification = {
  _id: string
  title: string
  message: string
  type: 'order' | 'info' | 'warning'
  isRead: boolean
  createdAt: string
  orderId?: string
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, hasNew, markAsRead, markAllAsRead } =
    useRealtimeNotifications()

  // 🔔 Animation khi có thông báo mới
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (hasNew) {
      setPulse(true)
      setTimeout(() => setPulse(false), 2000)
    }
  }, [hasNew])

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  // ✅ Filter out invalid notifications
  const validNotifications = (notifications || []).filter(
    (n: any) => n && n._id
  )

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'relative p-2 rounded-lg transition-all duration-200',
            'hover:bg-white/40 dark:hover:bg-white/10',
            pulse && 'animate-bounce'
          )}
        >
          <Bell
            className={cn(
              'w-5 h-5 text-gray-700 dark:text-gray-300 transition-colors',
              pulse && 'text-orange-500'
            )}
          />

          {/* Badge số lượng chưa đọc */}
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1 min-w-[18px] h-[18px]',
                'bg-red-500 text-white rounded-full',
                'text-[10px] font-bold flex items-center justify-center',
                'shadow-lg',
                pulse && 'animate-ping'
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 p-0 shadow-xl border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-sm">
            Thông báo {unreadCount > 0 && `(${unreadCount})`}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Đọc tất cả
            </button>
          )}
        </div>

        {/* Danh sách thông báo */}
        <div className="max-h-[400px] overflow-y-auto">
          {validNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Không có thông báo</p>
            </div>
          ) : (
            <div className="divide-y">
              {validNotifications.map((notification: Notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ========================================
// NOTIFICATION ITEM COMPONENT
// ========================================
function NotificationItem({
  notification,
  onMarkAsRead
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'order':
        return '🛍️'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  const formatTime = (date: string) => {
    try {
      return format(new Date(date), 'HH:mm - dd/MM/yyyy', { locale: vi })
    } catch {
      return ''
    }
  }

  return (
    <div
      className={cn(
        'px-4 py-3 transition-colors cursor-pointer hover:bg-gray-50',
        !notification.isRead && 'bg-blue-50/50'
      )}
      onClick={() => onMarkAsRead(notification._id)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                'text-sm leading-snug',
                !notification.isRead ? 'font-semibold' : 'font-medium'
              )}
            >
              {notification.title}
            </h4>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>

          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>

          <p className="text-xs text-gray-400 mt-1.5">
            {formatTime(notification.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useNotifications } from '@/src/hooks/useNotifications'
import socket from '@/src/lib/socket'
import { toast } from 'sonner'

export default function useRealtimeNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications()

  // 🔔 Hiệu ứng highlight chuông: có thông báo mới
  const [hasNew, setHasNew] = useState(false)

  useEffect(() => {
    if (!socket) return

    // Khi server gửi thông báo mới
    socket.on('notification:new', (data: any) => {
      // 🔥 Hiệu ứng chuông sáng
      setHasNew(true)
      setTimeout(() => setHasNew(false), 2000)

      // 🔥 Popup toast
      toast.info(data.title || 'Thông báo mới', {
        description: data.message
      })
    })

    return () => {
      socket.off('notification:new')
    }
  }, [])

  return {
    notifications: notifications || [],
    unreadCount: unreadCount || 0,
    hasNew,
    markAsRead,
    markAllAsRead
  }
}

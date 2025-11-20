'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/src/lib/api'

const REFRESH_MS = 8000

export function useNotifications() {
  const queryClient = useQueryClient()

  /* ------------------------------
     Lấy danh sách thông báo
  -------------------------------- */
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/admin/notifications')
      // 🔥 FIX QUAN TRỌNG:
      // nếu API trả { notifications: [...] }
      if (Array.isArray(data)) return data
      if (Array.isArray(data.notifications)) return data.notifications
      return []
    },
    refetchInterval: REFRESH_MS
  })

  /* ------------------------------
     Lấy số lượng chưa đọc
  -------------------------------- */
  const unreadCountQuery = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      const { data } = await api.get('/admin/notifications/unread-count')
      return data?.unread ?? 0
    },
    refetchInterval: REFRESH_MS
  })

  /* ------------------------------ */
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/admin/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
    }
  })

  /* ------------------------------ */
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await api.put('/admin/notifications/read-all')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
    }
  })

  return {
    notifications: notificationsQuery.data ?? [],
    unreadCount: unreadCountQuery.data ?? 0,

    isLoading: notificationsQuery.isLoading,
    isCountLoading: unreadCountQuery.isLoading,

    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate
  }
}

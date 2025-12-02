'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/src/lib/api'

const REFRESH_MS = 8000

export function useNotifications() {
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/notifications')
        // Handle different response formats
        let notifications = []

        if (Array.isArray(data)) {
          notifications = data
        } else if (Array.isArray(data?.notifications)) {
          notifications = data.notifications
        } else if (data?.data && Array.isArray(data.data)) {
          notifications = data.data
        }
        return notifications
      } catch (error) {
        return []
      }
    },
    refetchInterval: REFRESH_MS
  })

  const unreadCountQuery = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/notifications/unread-count')
        return data?.unread ?? 0
      } catch (error) {
        return 0
      }
    },
    refetchInterval: REFRESH_MS
  })

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/admin/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
    },
    onError: (error) => {}
  })

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await api.put('/admin/notifications/read-all')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
    },
    onError: (error) => {}
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

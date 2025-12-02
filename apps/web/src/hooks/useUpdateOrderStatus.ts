import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/src/lib/api'

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderId,
      status
    }: {
      orderId: string
      status: OrderStatus
    }) => {
      // ✅ SỬA: Dùng ngoặc đơn () thay vì backtick ``
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status })
      return res.data
    },
    onSuccess: () => {
      // ⭐ Invalidate tất cả queries liên quan đến orders
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: (error: any) => {
      console.error('Failed to update order status:', error)
    }
  })
}

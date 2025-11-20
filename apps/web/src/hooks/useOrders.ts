import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/src/lib/api'

export function useOrders(status: string = 'all') {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: async () => {
      const { data } = await api.get(`/admin/orders?status=${status}`)
      return data.orders
    }
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/admin/orders/${id}/status`, { status })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

// useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/src/lib/api'

export function useOrders(status: string = 'all') {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: async () => {
      console.log('🔍 Fetching /admin/orders...')

      const response = await api.get('/admin/orders', {
        params: { status }
      })

      console.log('📡 Raw response:', response)
      console.log('📦 Response data:', response.data)
      console.log('📊 Is array?', Array.isArray(response.data))

      const { data } = response

      // Handle different response formats
      if (Array.isArray(data)) {
        console.log('✅ Data is array, length:', data.length)
        return data
      }

      if (data?.orders && Array.isArray(data.orders)) {
        console.log('✅ Data has orders property, length:', data.orders.length)
        return data.orders
      }

      console.warn('⚠️ Unexpected format:', data)
      return []
    }
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/admin/orders/${id}/status`, {
        status
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order'] })
    }
  })
}

import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'

export function useOrderDetail(id?: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null
      const { data } = await api.get(`/admin/orders/${id}`)
      return data // KHÔNG data.order nữa
    },
    enabled: !!id
  })
}

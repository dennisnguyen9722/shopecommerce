import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'

export function useRevenue() {
  return useQuery({
    queryKey: ['revenue'],
    queryFn: async () => {
      const { data } = await api.get('/admin/revenue')
      return data
    },
    staleTime: 1000 * 60 * 5
  })
}

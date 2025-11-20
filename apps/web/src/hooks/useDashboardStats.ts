import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'

export const useRevenue = () =>
  useQuery({
    queryKey: ['dashboard', 'revenue'],
    queryFn: async () => {
      const { data } = await api.get('/admin/revenue')
      return data
    }
  })

export const useOrdersStats = () =>
  useQuery({
    queryKey: ['dashboard', 'orders'],
    queryFn: async () => {
      const { data } = await api.get('/admin/orders-stats')
      return data
    }
  })

export const useCustomersStats = () =>
  useQuery({
    queryKey: ['dashboard', 'customers'],
    queryFn: async () => {
      const { data } = await api.get('/admin/customers-stats')
      return data
    }
  })

'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'

const fetchMetrics = async () => {
  const { data } = await api.get('/admin/metrics')
  return data
}

export default function MetricsPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics
  })

  if (isLoading) return <p>Đang tải dữ liệu...</p>
  if (error) return <p>Lỗi khi tải dữ liệu 😢</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="border rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500">Doanh thu (30 ngày)</p>
        <p className="text-xl font-semibold text-green-600">
          {data.revenue?.toLocaleString('vi-VN')} ₫
        </p>
      </div>
      <div className="border rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500">Đơn hàng</p>
        <p className="text-xl font-semibold">{data.orders}</p>
      </div>
      <div className="border rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500">Khách hàng mới</p>
        <p className="text-xl font-semibold">{data.newCustomers}</p>
      </div>
      <div className="border rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500">Tổng đơn</p>
        <p className="text-xl font-semibold">{data.totalOrders}</p>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { loyaltyApi } from '@/src/services/loyalty'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/store/authStore' // 🔥 IMPORT ZUSTAND STORE
import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  PackageCheck,
  Ban
} from 'lucide-react'
import { toast } from 'sonner'

type OrderStatus =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'completed'
  | 'cancelled'

const STATUS_TABS = [
  { key: 'all', label: 'Tất cả', icon: Package },
  { key: 'pending', label: 'Chờ xác nhận', icon: Clock },
  { key: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle },
  { key: 'shipping', label: 'Đang vận chuyển', icon: Truck },
  { key: 'completed', label: 'Đã giao hàng', icon: PackageCheck },
  { key: 'cancelled', label: 'Đã hủy', icon: Ban }
]

export default function OrderHistoryPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore() // 🔥 LẤY TỪ ZUSTAND

  const [activeTab, setActiveTab] = useState<OrderStatus>('all')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch orders khi component mount
  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || !user?.email) {
        toast.error('Vui lòng đăng nhập để xem lịch sử đơn hàng')
        router.push('/login')
        return
      }
      fetchOrders()
    }
  }, [mounted, isAuthenticated, user])

  const fetchOrders = async () => {
    if (!user?.email) return

    try {
      setLoading(true)

      // 🔥 GỌI API VỚI EMAIL TỪ ZUSTAND
      const res = await loyaltyApi.getMyOrders(user.email)
      setOrders(res.data.orders || [])
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      toast.error(
        error?.response?.data?.error || 'Không thể tải lịch sử đơn hàng'
      )
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Filter orders theo tab
  const filteredOrders =
    activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab)

  // Status badge
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        pending: {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          label: 'Chờ xác nhận'
        },
        confirmed: {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          label: 'Đã xác nhận'
        },
        shipping: {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          label: 'Đang vận chuyển'
        },
        completed: {
          bg: 'bg-green-50',
          text: 'text-green-700',
          label: 'Đã giao hàng'
        },
        cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Đã hủy' }
      }
    return badges[status] || badges.pending
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Lịch sử mua hàng
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi tất cả đơn hàng của bạn
          </p>
        </div>

        {/* Status Tabs - Giống CellphoneS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex min-w-max">
            {STATUS_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as OrderStatus)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-orange-500 text-orange-600 bg-orange-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Order List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Chưa có đơn hàng nào</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const badge = getStatusBadge(order.status)
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Đơn hàng:</p>
                        <p className="font-bold text-gray-900">
                          #
                          {order.orderNumber ||
                            order._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                      <div className="hidden sm:block">
                        <p className="text-sm text-gray-500">Ngày đặt hàng:</p>
                        <p className="font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString(
                            'vi-VN'
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4 mb-4">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4">
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 mb-1 line-clamp-2">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.price.toLocaleString('vi-VN')}₫
                            </p>
                            {order.items.length > 1 && (
                              <p className="text-sm text-gray-500">
                                Cùng {order.items.length - 1} sản phẩm khác
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="text-sm text-gray-600">
                        {order.voucherCode &&
                          `Đã dùng voucher: ${order.voucherCode}`}
                        {order.couponCode &&
                          `Đã dùng coupon: ${order.couponCode}`}
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">
                            Tổng thanh toán:
                          </p>
                          <p className="text-xl font-bold text-orange-600">
                            {order.totalPrice.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                        <button
                          onClick={() => router.push(`/orders/${order._id}`)}
                          className="px-6 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors whitespace-nowrap"
                        >
                          Xem chi tiết →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

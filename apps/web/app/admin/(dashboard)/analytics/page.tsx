'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react'
import StatCard from './components/StatCard'
import RevenueChart from './components/RevenueChart'
import OrderStatusChart from './components/OrderStatusChart'
import TopProductsTable from './components/TopProductsTable'
import RecentOrdersWidget from './components/RecentOrdersWidget'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminAuthStore } from '@/src/store/adminAuthStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>(
    'month'
  )
  const token = useAdminAuthStore((s) => s.token)

  // Fetch dashboard overview
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard-overview', period],
    queryFn: async () => {
      const days =
        period === 'today'
          ? 1
          : period === 'week'
          ? 7
          : period === 'month'
          ? 30
          : 365
      const { data } = await axios.get(
        `${API_URL}/analytics/dashboard-overview?days=${days}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    refetchInterval: 30000,
    enabled: !!token
  })

  // Fetch revenue chart data
  const { data: revenueData } = useQuery({
    queryKey: ['revenue-chart', period],
    queryFn: async () => {
      const days =
        period === 'today'
          ? 1
          : period === 'week'
          ? 7
          : period === 'month'
          ? 30
          : 365
      const { data } = await axios.get(
        `${API_URL}/analytics/revenue-chart?days=${days}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    enabled: !!token
  })

  // Fetch order status distribution
  const { data: orderStatus } = useQuery({
    queryKey: ['order-status', period],
    queryFn: async () => {
      const days =
        period === 'today'
          ? 1
          : period === 'week'
          ? 7
          : period === 'month'
          ? 30
          : 365
      const { data } = await axios.get(
        `${API_URL}/analytics/order-status-distribution?days=${days}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    enabled: !!token
  })

  // Fetch top products
  const { data: topProducts } = useQuery({
    queryKey: ['best-products', period],
    queryFn: async () => {
      const days =
        period === 'today'
          ? 1
          : period === 'week'
          ? 7
          : period === 'month'
          ? 30
          : 365
      const { data } = await axios.get(
        `${API_URL}/analytics/best-products?days=${days}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    enabled: !!token
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-foreground">Đang tải dữ liệu...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan và phân tích dữ liệu kinh doanh
          </p>
        </div>

        {/* Period Selector */}
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as any)}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="today">Hôm nay</TabsTrigger>
            <TabsTrigger value="week">7 ngày</TabsTrigger>
            <TabsTrigger value="month">30 ngày</TabsTrigger>
            <TabsTrigger value="year">Năm nay</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(overview?.revenue?.value || 0)}
          growth={overview?.revenue?.growth || 0}
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-green-100 dark:bg-green-500/20"
          iconColor="text-green-600 dark:text-green-400"
        />

        <StatCard
          title="Đơn hàng"
          value={overview?.orders?.value?.toString() || '0'}
          growth={overview?.orders?.growth || 0}
          icon={<ShoppingCart className="w-6 h-6" />}
          iconBgColor="bg-blue-100 dark:bg-blue-500/20"
          iconColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Giá trị TB/Đơn"
          value={formatCurrency(overview?.avgOrderValue?.value || 0)}
          growth={overview?.avgOrderValue?.growth || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor="bg-purple-100 dark:bg-purple-500/20"
          iconColor="text-purple-600 dark:text-purple-400"
        />

        <StatCard
          title="Sản phẩm"
          value={overview?.products?.total?.toString() || '0'}
          subtitle={`${overview?.products?.lowStock || 0} sắp hết hàng`}
          icon={<Package className="w-6 h-6" />}
          iconBgColor="bg-orange-100 dark:bg-orange-500/20"
          iconColor="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData || []} />
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={orderStatus || []} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsTable data={topProducts || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng mới nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOrdersWidget />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

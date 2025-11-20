import React from 'react'
import ReactQueryProvider from '@/src/providers/ReactQueryProvider'
import MetricsPanel from '@/src/components/admin/MetricsPanel'
import RevenueChart from '@/src/components/admin/RevenueChart'
import DashboardTabs from '@/src/components/admin/DashboardTabs'

import InventoryOverviewWidget from '@/src/components/admin/InventoryOverviewWidget'
import BestSellingProductsWidget from '@/src/components/admin/BestSellingProductsWidget'
import TopCustomersWidget from '@/src/components/admin/TopCustomersWidget'
import PurchaseFrequencyWidget from '@/src/components/admin/PurchaseFrequencyWidget'

export default function AdminOverviewPage() {
  return (
    <ReactQueryProvider>
      <main className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Admin — Tổng quan</h1>

        {/* KPIs */}
        <MetricsPanel />

        {/* ⭐ Inventory Overview thêm vào đây */}
        <InventoryOverviewWidget />

        {/* Biểu đồ doanh thu */}
        <RevenueChart />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BestSellingProductsWidget />
          <TopCustomersWidget />
        </div>

        <PurchaseFrequencyWidget />

        {/* Tabs: đơn hàng / khách hàng */}
        <DashboardTabs />
      </main>
    </ReactQueryProvider>
  )
}

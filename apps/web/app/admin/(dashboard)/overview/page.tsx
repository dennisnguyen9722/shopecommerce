import React from 'react'
import ReactQueryProvider from '@/src/providers/ReactQueryProvider'
import MetricsPanel from '@/src/components/admin/MetricsPanel'

import InventoryOverviewWidget from '@/src/components/admin/InventoryOverviewWidget'
import BestSellingProductsWidget from '@/src/components/admin/BestSellingProductsWidget'
import TopCustomersWidget from '@/src/components/admin/TopCustomersWidget'

export default function AdminOverviewPage() {
  return (
    <ReactQueryProvider>
      {/* Hero Section with Gradient */}
      <div>
        {/* Animated Background Circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />

        <main className="relative p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Chào mừng trở lại! Đây là tổng quan về hoạt động kinh doanh của
              bạn
            </p>
          </div>

          {/* KPIs - Metrics Panel */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MetricsPanel />
          </div>

          {/* Inventory Overview */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <InventoryOverviewWidget />
          </div>

          {/* Grid Layout - Best Selling & Top Customers */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <BestSellingProductsWidget />
            <TopCustomersWidget />
          </div>

          {/* Bottom Spacing */}
          <div className="h-8" />
        </main>
      </div>
    </ReactQueryProvider>
  )
}

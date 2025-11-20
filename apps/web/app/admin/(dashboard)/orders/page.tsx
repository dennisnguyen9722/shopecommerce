'use client'

import OrdersTable from '@/src/components/admin/OrdersTable'

export default function OrdersPage() {
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Đơn hàng</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tất cả đơn hàng khách đặt.
          </p>
        </div>
      </div>

      {/* TABLE + FILTER (Glass UI v2) */}
      <OrdersTable />
    </div>
  )
}

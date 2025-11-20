'use client'

import React from 'react'
import { Sidebar } from '@/src/components/admin/Sidebar'
import { Header } from '@/src/components/admin/Header'
import ReactQueryProvider from '@/src/providers/ReactQueryProvider'
import useRealtimeNotifications from '@/src/hooks/useRealtimeNotifications'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ReactQueryProvider>
      <AdminShell>{children}</AdminShell>
    </ReactQueryProvider>
  )
}

function AdminShell({ children }: { children: React.ReactNode }) {
  useRealtimeNotifications()

  return (
    <div className="flex h-screen w-full">
      {/* SIDEBAR FIXED */}
      <aside className="fixed left-0 top-0 h-screen z-40">
        <Sidebar />
      </aside>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 ml-64">
        {/* HEADER (Glass, Fixed) */}
        <Header />

        {/* PAGE CONTENT SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-6 bg-linear-to-br from-gray-50 to-gray-100">
          <div className="max-w-[1500px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

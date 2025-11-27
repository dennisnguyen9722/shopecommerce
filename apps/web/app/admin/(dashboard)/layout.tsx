'use client'

import { Sidebar } from '@/src/components/admin/Sidebar'
import { Header } from '@/src/components/admin/Header'
import { useState } from 'react'

export default function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [sidebarWidth, setSidebarWidth] = useState(260)

  return (
    <div className="w-full min-h-screen flex bg-[#f8f9fc]">
      {/* SIDEBAR FIXED */}
      <aside
        className="fixed left-0 top-0 h-screen z-30"
        style={{ width: sidebarWidth }}
      >
        <Sidebar onWidthChange={(w) => setSidebarWidth(w)} />
      </aside>

      {/* MAIN CONTENT */}
      <main
        className="flex-1 min-h-screen transition-all"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-white">
          <Header />
        </div>

        {/* PAGE CONTENT */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

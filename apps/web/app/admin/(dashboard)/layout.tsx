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
    <div className="w-full min-h-screen flex">
      {/* SIDEBAR */}
      <Sidebar onWidthChange={(w) => setSidebarWidth(w)} />

      {/* MAIN CONTENT AREA */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* HEADER */}
        <Header />

        {/* PAGE CONTENT */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

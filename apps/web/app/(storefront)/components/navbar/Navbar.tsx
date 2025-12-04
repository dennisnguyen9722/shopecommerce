'use client'

import NavbarTop from './NavbarTop'
import NavbarCategories from './NavbarCategories'
import { useScrollPosition } from '@/app/(storefront)/components/navbar/useScrollPosition'

export default function Navbar() {
  const scrolled = useScrollPosition(10)

  return (
    <header className="w-full z-50 bg-white">
      {/* 🟢 PHẦN NÀY SẼ DÍNH LẠI (STICKY) */}
      <div
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <NavbarTop scrolled={scrolled} />
      </div>

      {/* 🔴 PHẦN NÀY SẼ TRÔI ĐI KHI CUỘN */}
      {/* relative z-40 để nó nằm dưới cái shadow của thanh trên khi cuộn qua */}
      <div className="relative z-40 bg-white">
        <NavbarCategories />
      </div>
    </header>
  )
}

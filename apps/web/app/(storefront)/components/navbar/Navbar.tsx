'use client'

import { useState, useEffect, useRef } from 'react'
import NavbarTop from './NavbarTop'
import NavbarCategories from './NavbarCategories'
import { useScrollPosition } from '@/app/(storefront)/components/navbar/useScrollPosition'

export default function Navbar() {
  const scrolled = useScrollPosition(10)
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  // Tự động tính chiều cao của Header để tạo khoảng trống (Spacer) tương ứng bên dưới
  // Giúp nội dung không bị Header che mất vì Header đang là 'fixed'
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [scrolled]) // Tính lại khi scroll (vì NavbarTop có co giãn padding)

  return (
    <>
      {/* 🟢 HEADER CHÍNH: Dùng fixed để dính chặt lên trên cùng */}
      <header
        ref={headerRef}
        className={`
          fixed top-0 left-0 right-0 z-100 w-full bg-white transition-all duration-300
          ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}
        `}
      >
        {/* NavbarTop: Sẽ co nhỏ lại khi scroll nhờ prop 'scrolled' */}
        <NavbarTop scrolled={scrolled} />

        {/* NavbarCategories: Luôn hiển thị ngay bên dưới NavbarTop */}
        <div className="bg-white border-t border-gray-100">
          <NavbarCategories />
        </div>
      </header>

      {/* 🟡 SPACER DIV: Khoảng trống vô hình để đẩy nội dung xuống */}
      {/* Nếu không có cái này, banner/slider sẽ bị chui tọt vào gầm header */}
      <div
        style={{ height: headerHeight > 0 ? `${headerHeight}px` : '128px' }}
        className="w-full transition-all duration-300"
      />
    </>
  )
}

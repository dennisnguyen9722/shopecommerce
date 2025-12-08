'use client'

import { useState, useEffect, useRef } from 'react'
import NavbarTop from './NavbarTop'
import NavbarCategories from './NavbarCategories'
import { useScrollPosition } from '@/app/(storefront)/components/navbar/useScrollPosition'

export default function Navbar() {
  const scrolled = useScrollPosition(10)
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  // Tính chiều cao header để đẩy nội dung xuống
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [scrolled])

  return (
    <>
      {/* 🟢 HEADER CHÍNH */}
      <header
        ref={headerRef}
        className={`
          fixed top-0 left-0 right-0 w-full transition-all duration-300
          
          /* 👇 QUAN TRỌNG: Giảm z-index xuống 40 để thấp hơn Modal (thường là 50) */
          z-40
          
          /* 👇 HIỆU ỨNG: Lúc chưa scroll thì nền trắng cứng, scroll rồi thì trắng mờ */
          ${
            scrolled
              ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50'
              : 'bg-white border-b border-gray-100'
          }
        `}
      >
        {/* NavbarTop */}
        <div className="bg-transparent">
          <NavbarTop scrolled={scrolled} />
        </div>

        {/* NavbarCategories */}
        <div
          className={`
            border-t border-gray-100 
            bg-transparent
        `}
        >
          <NavbarCategories />
        </div>
      </header>

      {/* 🟡 SPACER DIV: Đẩy nội dung xuống */}
      <div
        style={{ height: headerHeight > 0 ? `${headerHeight}px` : '128px' }}
        className="w-full transition-all duration-300"
      />
    </>
  )
}

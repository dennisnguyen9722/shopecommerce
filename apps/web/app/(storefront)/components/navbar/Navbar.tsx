'use client'

import { useState, useEffect } from 'react'
import NavbarTop from './NavbarTop'
import NavbarCategories from './NavbarCategories'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="sticky top-0 left-0 w-full z-50">
      <NavbarTop scrolled={scrolled} />
      <NavbarCategories />
    </header>
  )
}

'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Banner = {
  _id?: string
  id?: string | number
  imageUrl: string
  title?: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
}

export default function Hero({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0)

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length])

  const goToSlide = (index: number) => {
    setActive(index)
  }

  const goToPrev = () => {
    setActive((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setActive((prev) => (prev + 1) % banners.length)
  }

  return (
    <div className="relative w-full h-[520px] overflow-hidden rounded-3xl shadow-2xl group">
      {/* Banner Images */}
      {banners.map((item, index) => {
        const key = item._id || item.id || `banner-${index}`
        return (
          <div
            key={key}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title ?? 'banner'}
                fill
                className="object-cover"
                priority={index === 0}
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300" />
            )}
          </div>
        )
      })}

      {/* Navigation Arrows - Show on hover */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      {/* Dots Navigation - Glassmorphism */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-10">
        {banners.map((item, i) => {
          const key = item._id || item.id || `dot-${i}`
          return (
            <button
              key={key}
              onClick={() => goToSlide(i)}
              className={`transition-all duration-300 rounded-full ${
                active === i
                  ? 'w-12 h-3 backdrop-blur-md bg-white border border-white/50 shadow-md'
                  : 'w-3 h-3 backdrop-blur-sm bg-white/40 hover:bg-white/60 border border-white/30'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 backdrop-blur-sm">
        <div
          className="h-full bg-linear-to-r from-orange-400 to-orange-600 transition-all duration-300 shadow-lg"
          style={{ width: `${((active + 1) / banners.length) * 100}%` }}
        />
      </div>
    </div>
  )
}

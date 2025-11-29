'use client'

import { useState, useEffect } from 'react'
import { Zap, Clock, TrendingUp } from 'lucide-react'

// ✅ CHUYỂN TIMEBOX RA NGOÀI COMPONENT
const TimeBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div
      className="
      relative w-16 h-16 md:w-20 md:h-20
      bg-white/20 backdrop-blur-xl
      border-2 border-white/30
      rounded-2xl
      flex items-center justify-center
      shadow-2xl
      group-hover:scale-110 transition-transform duration-300
    "
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl animate-pulse" />
      <span className="relative text-2xl md:text-3xl font-black text-white z-10">
        {value.toString().padStart(2, '0')}
      </span>
    </div>
    <span className="text-xs md:text-sm text-white/80 font-bold mt-2 uppercase tracking-wider">
      {label}
    </span>
  </div>
)

export default function FlashSaleBanner() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else {
          // Reset countdown
          hours = 23
          minutes = 59
          seconds = 59
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full py-4 relative overflow-hidden group">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 animate-gradient-x" />

      {/* Moving particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-400/30 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-orange-400/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-2xl">
              <Zap className="w-7 h-7 text-red-600" fill="currentColor" />
            </div>

            <div className="text-left">
              <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                FLASH SALE
                <span className="inline-block px-3 py-1 bg-yellow-400 text-red-600 text-sm rounded-full font-black animate-pulse">
                  -50%
                </span>
              </h3>
              <p className="text-white/90 text-sm font-medium">
                Siêu sale giờ vàng - Giảm đến 50% mọi sản phẩm
              </p>
            </div>
          </div>

          {/* Center: Countdown */}
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-white animate-pulse" />
            <div className="flex gap-2">
              <TimeBox value={timeLeft.hours} label="Giờ" />
              <div className="flex items-center text-white text-2xl font-black">
                :
              </div>
              <TimeBox value={timeLeft.minutes} label="Phút" />
              <div className="flex items-center text-white text-2xl font-black">
                :
              </div>
              <TimeBox value={timeLeft.seconds} label="Giây" />
            </div>
          </div>

          {/* Right: CTA */}
          <a
            href="/flash-sale"
            className="
              group/btn relative px-8 py-4 
              bg-white text-red-600 
              font-black text-lg rounded-2xl
              shadow-2xl
              hover:scale-110 hover:rotate-1
              transition-all duration-300
              flex items-center gap-3
              overflow-hidden
            "
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300" />

            <span className="relative z-10">Mua ngay</span>
            <TrendingUp className="relative z-10 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
    </div>
  )
}

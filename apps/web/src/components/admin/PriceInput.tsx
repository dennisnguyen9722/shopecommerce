/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import clsx from 'clsx'

export default function PriceInputShopifyPlus({
  value,
  onChange
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [display, setDisplay] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const format = (num: number) => (num ? num.toLocaleString('vi-VN') : '')

  const parseNumber = (s: string) => Number(s.replace(/[^\d]/g, ''))

  // Sync from React Hook Form
  useEffect(() => {
    if (!focused) setDisplay(format(value))
  }, [value, focused])

  const handleFocus = () => {
    setFocused(true)
    setDisplay(value ? value.toString() : '')
    // move caret to end
    setTimeout(() => {
      inputRef.current?.setSelectionRange(display.length, display.length)
    }, 0)
  }

  const handleBlur = () => {
    setFocused(false)
    setDisplay(format(parseNumber(display)))
  }

  const handleChange = (e: any) => {
    const raw = e.target.value
    // only numbers allowed
    const parsed = parseNumber(raw)
    setDisplay(raw)
    onChange(parsed)
  }

  return (
    <div className="relative w-full">
      {/* PREFIX TIỀN TỆ */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
        ₫
      </span>

      <Input
        ref={inputRef}
        value={display}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        inputMode="numeric"
        className={clsx(
          'pl-7 font-medium',
          'focus-visible:ring-2 focus-visible:ring-purple-500'
        )}
        placeholder="0"
      />
    </div>
  )
}

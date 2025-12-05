/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Variant {
  _id: string
  sku: string
  price: number
  stock: number
  options: Record<string, string>
  image?: string // Thêm trường image vào type
}

interface Group {
  name: string
  values: string[]
}

interface Props {
  groups: Group[]
  variants: Variant[]
  onVariantChange: (variant: Variant | null) => void
}

// 🎨 BẢNG MÀU MỞ RỘNG (Thêm Tím, Xanh...)
const COLOR_MAP: Record<string, string> = {
  đen: '#000000',
  black: '#000000',
  trắng: '#ffffff',
  white: '#ffffff',
  bạc: '#e3e4e5',
  silver: '#e3e4e5',
  xám: '#808080',
  gray: '#808080',
  'space gray': '#5e5e60',
  đỏ: '#dc2626',
  red: '#dc2626',
  vàng: '#facc15',
  gold: '#d4af37',
  xanh: '#2563eb',
  blue: '#2563eb',
  'xanh dương': '#2563eb',
  tím: '#9333ea',
  purple: '#9333ea',
  violet: '#8b5cf6',
  hồng: '#f472b6',
  pink: '#f472b6',
  cam: '#f97316',
  orange: '#f97316',
  midnight: '#1e293b', // Màu xanh đen của Apple
  starlight: '#f8fafc', // Màu ánh sao
  'titan tự nhiên': '#a1a1aa',
  'natural titanium': '#a1a1aa'
}

export default function ProductVariantSelector({
  groups,
  variants,
  onVariantChange
}: Props) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({})

  // 1. Tự động chọn option đầu tiên
  useEffect(() => {
    if (
      groups &&
      groups.length > 0 &&
      Object.keys(selectedOptions).length === 0
    ) {
      const defaults: Record<string, string> = {}
      groups.forEach((g) => {
        if (g.values.length > 0) {
          defaults[g.name] = g.values[0]
        }
      })
      setSelectedOptions(defaults)
    }
  }, [groups])

  // 2. Tìm variant khớp
  useEffect(() => {
    if (Object.keys(selectedOptions).length === 0) return
    const found = variants.find((v) => {
      return Object.entries(selectedOptions).every(
        ([key, val]) => v.options[key] === val
      )
    })
    onVariantChange(found || null)
  }, [selectedOptions, variants, onVariantChange])

  const handleSelect = (groupName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupName]: value }))
  }

  if (!groups || groups.length === 0) return null

  return (
    <div className="space-y-6 my-6">
      {groups.map((group) => {
        // Check xem có phải nhóm màu sắc không
        const isColorGroup = ['màu sắc', 'color', 'màu', 'colour'].includes(
          group.name.toLowerCase()
        )

        return (
          <div key={group.name}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-900">
                {group.name}:
              </span>
              <span className="text-sm font-medium text-blue-600">
                {selectedOptions[group.name]}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {group.values.map((val) => {
                const isSelected = selectedOptions[group.name] === val

                // Logic thông minh: Kiểm tra xem có mã màu không
                const colorCode = isColorGroup
                  ? COLOR_MAP[val.toLowerCase()]
                  : null

                // 🟢 TRƯỜNG HỢP 1: LÀ MÀU SẮC & CÓ MÃ MÀU -> HIỆN CHẤM TRÒN
                if (colorCode) {
                  return (
                    <button
                      key={val}
                      onClick={() => handleSelect(group.name, val)}
                      className={cn(
                        'relative w-10 h-10 rounded-full shadow-sm transition-all duration-200 flex items-center justify-center',
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-blue-600 scale-110'
                          : 'hover:scale-105 ring-1 ring-gray-200 hover:ring-gray-300'
                      )}
                      style={{ backgroundColor: colorCode }}
                      title={val}
                    >
                      {/* Viền nhẹ cho màu trắng/sáng */}
                      {['#ffffff', '#f8fafc'].includes(colorCode) && (
                        <span className="absolute inset-0 rounded-full border border-gray-300" />
                      )}
                    </button>
                  )
                }

                // 🔵 TRƯỜNG HỢP 2: KHÔNG PHẢI MÀU (SIZE...) HOẶC MÀU LẠ -> HIỆN NÚT CHỮ
                return (
                  <button
                    key={val}
                    onClick={() => handleSelect(group.name, val)}
                    className={cn(
                      'px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 min-w-[3rem] relative overflow-hidden',
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {val}
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-blue-600 rounded-bl-md"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

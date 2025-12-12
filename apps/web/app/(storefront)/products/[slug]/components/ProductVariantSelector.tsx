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
  image?: string
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

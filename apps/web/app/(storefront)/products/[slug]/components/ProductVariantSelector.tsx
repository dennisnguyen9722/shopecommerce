/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Định nghĩa lại kiểu dữ liệu cho khớp với Backend
interface Variant {
  _id: string
  sku: string
  price: number
  stock: number
  options: Record<string, string>
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
  // State lưu lựa chọn hiện tại: { "Màu sắc": "Đỏ", "Dung lượng": "128GB" }
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({})

  // 1. Tự động chọn option đầu tiên khi mới vào (để khách không thấy trống trơn)
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

  // 2. Mỗi khi user chọn lại, tìm variant khớp nhất
  useEffect(() => {
    if (Object.keys(selectedOptions).length === 0) return

    // Tìm variant nào khớp HẾT các options đang chọn
    const found = variants.find((v) => {
      // Vì options trong DB là Map/Object, ta so sánh từng key
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
    <div className="space-y-5 my-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
      {groups.map((group) => (
        <div key={group.name}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-900">
              {group.name}:
            </span>
            <span className="text-sm font-medium text-orange-600">
              {selectedOptions[group.name]}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {group.values.map((val) => {
              const isSelected = selectedOptions[group.name] === val

              // Kiểm tra xem option này có hàng không (Nâng cao - làm sau)
              // Tạm thời hiển thị tất cả

              return (
                <button
                  key={val}
                  onClick={() => handleSelect(group.name, val)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 min-w-[3rem]',
                    isSelected
                      ? 'border-orange-500 bg-white text-orange-600 shadow-sm ring-1 ring-orange-500'
                      : 'border-gray-200 text-gray-600 bg-white hover:border-orange-300 hover:text-orange-500'
                  )}
                >
                  {val}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

type CategoryItem = {
  _id: string
  name: string
  slug: string
}

type FilterState = {
  categoryId?: string | null
  minPrice?: string
  maxPrice?: string
  discountOnly?: boolean
  onlyHot?: boolean
  onlyNew?: boolean
  sort?: string
}

export default function ProductFilterSidebar({
  categories = [],
  categoryId,
  onFilterChange
}: {
  categories?: CategoryItem[]
  categoryId?: string | null
  onFilterChange: (filters: FilterState) => void
}) {
  const [filters, setFilters] = useState<FilterState>({
    categoryId: categoryId ?? null,
    sort: 'newest'
  })

  // Sync categoryId when user is on /category/*
  useEffect(() => {
    setFilters((f) => ({ ...f, categoryId: categoryId ?? null }))
  }, [categoryId])

  const update = (patch: Partial<FilterState>) => {
    const newFilters = { ...filters, ...patch }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="w-64 shrink-0 space-y-6 !bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-fit sticky top-4">
      {/* CATEGORY */}
      <div>
        <h3 className="font-semibold mb-3 !text-gray-900">Danh mục</h3>
        <Select
          value={filters.categoryId || 'all'}
          onValueChange={(v) => update({ categoryId: v === 'all' ? null : v })}
        >
          <SelectTrigger className="w-full !bg-white !text-gray-900 border-gray-300">
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent className="!bg-white">
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* PRICE */}
      <div>
        <h3 className="font-semibold mb-3 !text-gray-900">Khoảng giá</h3>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Từ"
            value={filters.minPrice || ''}
            onChange={(e) => update({ minPrice: e.target.value })}
            className="w-full !bg-white !text-gray-900 border-gray-300"
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            placeholder="Đến"
            value={filters.maxPrice || ''}
            onChange={(e) => update({ maxPrice: e.target.value })}
            className="w-full !bg-white !text-gray-900 border-gray-300"
          />
        </div>
      </div>

      {/* CHECKBOX FILTERS */}
      <div>
        <h3 className="font-semibold mb-3 !text-gray-900">Bộ lọc</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              checked={filters.discountOnly || false}
              onCheckedChange={(v) => update({ discountOnly: v === true })}
            />
            <span className="text-sm !text-gray-700 group-hover:text-orange-600 transition-colors">
              Giảm giá
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              checked={filters.onlyHot || false}
              onCheckedChange={(v) => update({ onlyHot: v === true })}
            />
            <span className="text-sm !text-gray-700 group-hover:text-orange-600 transition-colors">
              Nổi bật
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              checked={filters.onlyNew || false}
              onCheckedChange={(v) => update({ onlyNew: v === true })}
            />
            <span className="text-sm !text-gray-700 group-hover:text-orange-600 transition-colors">
              Mới về
            </span>
          </label>
        </div>
      </div>

      {/* SORT */}
      <div>
        <h3 className="font-semibold mb-3 !text-gray-900">Sắp xếp</h3>
        <Select value={filters.sort} onValueChange={(v) => update({ sort: v })}>
          <SelectTrigger className="w-full !bg-white !text-gray-900 border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="!bg-white">
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="price-asc">Giá tăng dần</SelectItem>
            <SelectItem value="price-desc">Giá giảm dần</SelectItem>
            <SelectItem value="discount">Giảm giá nhiều nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CLEAR FILTERS */}
      {(filters.minPrice ||
        filters.maxPrice ||
        filters.discountOnly ||
        filters.onlyHot ||
        filters.onlyNew) && (
        <button
          onClick={() =>
            update({
              minPrice: '',
              maxPrice: '',
              discountOnly: false,
              onlyHot: false,
              onlyNew: false
            })
          }
          className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium border border-orange-200 rounded-md py-2 hover:bg-orange-50 transition-colors"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  )
}

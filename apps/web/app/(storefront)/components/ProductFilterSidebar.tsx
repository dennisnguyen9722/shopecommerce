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
    if (categoryId) {
      setFilters((f) => ({ ...f, categoryId }))
    }
  }, [categoryId])

  const update = (patch: Partial<FilterState>) => {
    const newFilters = { ...filters, ...patch }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="w-64 shrink-0 space-y-8">
      {/* CATEGORY */}
      <div>
        <h3 className="font-semibold mb-3">Danh mục</h3>
        <Select
          value={filters.categoryId || 'all'}
          onValueChange={(v) => update({ categoryId: v === 'all' ? null : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
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
        <h3 className="font-semibold mb-3">Khoảng giá</h3>
        <div className="flex gap-3">
          <Input
            type="number"
            placeholder="Từ"
            value={filters.minPrice || ''}
            onChange={(e) => update({ minPrice: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Đến"
            value={filters.maxPrice || ''}
            onChange={(e) => update({ maxPrice: e.target.value })}
          />
        </div>
      </div>

      {/* CHECKBOX FILTERS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={filters.discountOnly || false}
            onCheckedChange={(v) => update({ discountOnly: v === true })}
          />
          <span>Giảm giá</span>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={filters.onlyHot || false}
            onCheckedChange={(v) => update({ onlyHot: v === true })}
          />
          <span>Nổi bật</span>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={filters.onlyNew || false}
            onCheckedChange={(v) => update({ onlyNew: v === true })}
          />
          <span>Mới về</span>
        </div>
      </div>

      {/* SORT */}
      <div>
        <h3 className="font-semibold mb-3">Sắp xếp</h3>
        <Select value={filters.sort} onValueChange={(v) => update({ sort: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="price-asc">Giá tăng dần</SelectItem>
            <SelectItem value="price-desc">Giá giảm dần</SelectItem>
            <SelectItem value="discount">Giảm giá nhiều nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

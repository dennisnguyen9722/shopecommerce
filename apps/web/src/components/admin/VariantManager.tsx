'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

// Kiểu dữ liệu
type VariantGroup = {
  name: string
  values: string[]
}

type VariantItem = {
  sku: string
  price: number
  stock: number
  options: Record<string, string>
}

interface Props {
  groups: VariantGroup[]
  setGroups: (g: VariantGroup[]) => void
  variants: VariantItem[]
  setVariants: (v: VariantItem[]) => void
  basePrice: number
}

export default function VariantManager({
  groups,
  setGroups,
  variants,
  setVariants,
  basePrice
}: Props) {
  // --- 1. QUẢN LÝ NHÓM (GROUPS) ---
  const addGroup = () => {
    setGroups([...groups, { name: '', values: [] }])
  }

  const removeGroup = (index: number) => {
    const newGroups = [...groups]
    newGroups.splice(index, 1)
    setGroups(newGroups)
  }

  const updateGroupName = (index: number, name: string) => {
    const newGroups = [...groups]
    newGroups[index].name = name
    setGroups(newGroups)
  }

  const addValueToGroup = (index: number, val: string) => {
    if (!val) return
    const newGroups = [...groups]
    if (!newGroups[index].values.includes(val)) {
      newGroups[index].values.push(val)
      setGroups(newGroups)
    }
  }

  const removeValueFromGroup = (gIndex: number, vIndex: number) => {
    const newGroups = [...groups]
    newGroups[gIndex].values.splice(vIndex, 1)
    setGroups(newGroups)
  }

  // --- 2. TỰ ĐỘNG SINH BIẾN THỂ (GENERATOR) ---
  useEffect(() => {
    if (groups.length === 0 || groups.some((g) => g.values.length === 0)) {
      // Nếu xóa hết nhóm -> reset variants
      if (groups.length === 0 && variants.length > 0) {
        setVariants([])
      }
      return
    }

    const generateCombinations = (
      groupIndex: number,
      currentOptions: Record<string, string>
    ): Record<string, string>[] => {
      if (groupIndex === groups.length) {
        return [currentOptions]
      }

      const group = groups[groupIndex]
      let combinations: Record<string, string>[] = []

      for (const val of group.values) {
        combinations = combinations.concat(
          generateCombinations(groupIndex + 1, {
            ...currentOptions,
            [group.name]: val
          })
        )
      }
      return combinations
    }

    const combos = generateCombinations(0, {})

    const newVariants = combos.map((options) => {
      const existing = variants.find(
        (v) => JSON.stringify(v.options) === JSON.stringify(options)
      )

      if (existing) return existing

      const skuSuffix = Object.values(options)
        .map((v) => v.toUpperCase().substring(0, 3))
        .join('-')

      return {
        sku: `SKU-${skuSuffix}-${Math.floor(Math.random() * 1000)}`,
        price: basePrice,
        stock: 0,
        options
      }
    })

    setVariants(newVariants)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups])

  // --- 3. CẬP NHẬT DỮ LIỆU VARIANT (Đã Fix lỗi TS) ---
  const updateVariant = (
    index: number,
    field: keyof VariantItem,
    value: string | number
  ) => {
    const newVars = [...variants]

    // ✅ FIX: Dùng spread operator để cập nhật an toàn, không cần @ts-ignore
    newVars[index] = {
      ...newVars[index],
      [field]: value
    }

    setVariants(newVars)
  }

  return (
    <div className="space-y-6">
      {/* PHẦN 1: ĐỊNH NGHĨA NHÓM */}
      <div className="space-y-4">
        {groups.map((group, idx) => (
          <div
            key={idx}
            className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group-hover:border-gray-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-1 flex-1">
                <Label>Tên nhóm biến thể (VD: Màu sắc, Size)</Label>
                <Input
                  value={group.name}
                  onChange={(e) => updateGroupName(idx, e.target.value)}
                  placeholder="Nhập tên nhóm..."
                  className="bg-white"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeGroup(idx)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-6 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Nhập giá trị */}
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">
                Các giá trị (Nhấn Enter để thêm)
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {group.values.map((val, vIdx) => (
                  <span
                    key={vIdx}
                    className="bg-white border px-2 py-1 rounded text-sm flex items-center gap-1 shadow-sm"
                  >
                    {val}
                    <button
                      onClick={() => removeValueFromGroup(idx, vIdx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                placeholder="Nhập giá trị rồi Enter (VD: Đỏ, Xanh...)"
                className="bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addValueToGroup(idx, e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          </div>
        ))}

        <Button
          onClick={addGroup}
          variant="outline"
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm nhóm biến thể mới
        </Button>
      </div>

      {/* PHẦN 2: DANH SÁCH BIẾN THỂ */}
      {variants.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Tên biến thể</TableHead>
                <TableHead className="w-[150px]">SKU</TableHead>
                <TableHead className="w-[120px]">Giá</TableHead>
                <TableHead className="w-[100px]">Tồn kho</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((v, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {Object.values(v.options).join(' / ')}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={v.sku}
                      onChange={(e) =>
                        updateVariant(idx, 'sku', e.target.value)
                      }
                      className="h-8 text-xs font-mono"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(idx, 'price', Number(e.target.value))
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(idx, 'stock', Number(e.target.value))
                      }
                      className="h-8"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

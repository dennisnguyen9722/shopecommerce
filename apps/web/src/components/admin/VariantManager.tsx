'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, ImagePlus, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
// 👇 Import hàm upload vừa tạo
import { uploadImage } from '@/src/lib/upload'

interface Props {
  groups: { name: string; values: string[] }[]
  setGroups: (groups: { name: string; values: string[] }[]) => void
  variants: any[]
  setVariants: (variants: any[]) => void
  basePrice: number
}

export default function VariantManager({
  groups,
  setGroups,
  variants,
  setVariants,
  basePrice
}: Props) {
  // State để hiển thị loading xoay xoay khi đang upload
  const [uploadingState, setUploadingState] = useState<Record<number, boolean>>(
    {}
  )

  // 1. Tự động tạo tổ hợp biến thể
  useEffect(() => {
    if (groups.length === 0) {
      setVariants([])
      return
    }

    const generateCombinations = (
      groupIndex: number,
      currentOptions: Record<string, string>
    ): any[] => {
      if (groupIndex === groups.length) {
        const sku = Object.values(currentOptions)
          .join('-')
          .toUpperCase()
          .replace(/\s+/g, '')

        // Giữ lại dữ liệu cũ nếu biến thể đã tồn tại
        const existing = variants.find((v) =>
          Object.entries(currentOptions).every(
            ([key, val]) => v.options[key] === val
          )
        )

        return [
          existing || {
            options: currentOptions,
            sku: `SKU-${sku}`,
            price: basePrice,
            stock: 0,
            image: '' // Trường chứa ảnh biến thể
          }
        ]
      }

      const group = groups[groupIndex]
      let combinations: any[] = []
      if (group.values.length === 0) return []

      group.values.forEach((value) => {
        combinations = [
          ...combinations,
          ...generateCombinations(groupIndex + 1, {
            ...currentOptions,
            [group.name]: value
          })
        ]
      })

      return combinations
    }

    const newVariants = generateCombinations(0, {})
    setVariants(newVariants)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, basePrice])

  // Xử lý nhóm (Thêm/Xóa)
  const addGroup = () => {
    setGroups([...groups, { name: '', values: [] }])
  }
  const removeGroup = (idx: number) => {
    const newGroups = [...groups]
    newGroups.splice(idx, 1)
    setGroups(newGroups)
  }

  // Cập nhật giá trị trong bảng
  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  // 🟢 HÀM UPLOAD ẢNH CHO 1 DÒNG
  const handleUploadRow = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingState((prev) => ({ ...prev, [index]: true }))

      // Gọi hàm từ file utils
      const url = await uploadImage(file)

      handleVariantChange(index, 'image', url)
      toast.success('Đã tải ảnh biến thể')
    } catch (error) {
      toast.error('Lỗi tải ảnh')
    } finally {
      setUploadingState((prev) => ({ ...prev, [index]: false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* KHU VỰC NHẬP NHÓM (MÀU, SIZE...) */}
      <div className="space-y-4">
        {groups.map((group, idx) => (
          <div key={idx} className="p-4 border rounded-lg bg-gray-50 relative">
            <button
              type="button"
              onClick={() => removeGroup(idx)}
              className="absolute top-2 right-2 text-red-500 hover:bg-red-100 p-1 rounded"
            >
              <X size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tên nhóm (VD: Màu sắc)</Label>
                <Input
                  value={group.name}
                  onChange={(e) => {
                    const newGroups = [...groups]
                    newGroups[idx].name = e.target.value
                    setGroups(newGroups)
                  }}
                />
              </div>
              <div>
                <Label>Giá trị (VD: Đỏ, Xanh - Phân cách bằng dấu phẩy)</Label>
                <Input
                  placeholder="Nhập và nhấn ra ngoài..."
                  onBlur={(e) => {
                    const valStr = e.target.value
                    if (valStr) {
                      const values = valStr
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                      const newGroups = [...groups]
                      newGroups[idx].values = values
                      setGroups(newGroups)
                    }
                  }}
                  defaultValue={group.values.join(', ')}
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addGroup}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm nhóm biến thể
        </Button>
      </div>

      {/* BẢNG BIẾN THỂ */}
      {variants.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-3">Biến thể</th>
                <th className="p-3 text-center">Ảnh</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Giá</th>
                <th className="p-3">Kho</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {variants.map((variant, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    {Object.values(variant.options).join(' / ')}
                  </td>

                  {/* CỘT UPLOAD ẢNH NHỎ GỌN */}
                  <td className="p-3 text-center">
                    <div className="flex justify-center">
                      <label
                        className={`
                            cursor-pointer group relative w-10 h-10 rounded border border-dashed border-gray-300 
                            flex items-center justify-center bg-white overflow-hidden hover:border-orange-500
                            ${uploadingState[index] ? 'opacity-50' : ''}
                        `}
                      >
                        {uploadingState[index] ? (
                          <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                        ) : variant.image ? (
                          <Image
                            src={variant.image}
                            alt="v"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ImagePlus className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                        )}

                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          disabled={uploadingState[index]}
                          onChange={(e) => handleUploadRow(index, e)}
                        />
                      </label>
                    </div>
                  </td>

                  <td className="p-3">
                    <Input
                      value={variant.sku}
                      onChange={(e) =>
                        handleVariantChange(index, 'sku', e.target.value)
                      }
                      className="h-8 w-28 text-xs"
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          'price',
                          Number(e.target.value)
                        )
                      }
                      className="h-8 w-28 text-xs"
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          'stock',
                          Number(e.target.value)
                        )
                      }
                      className="h-8 w-20 text-xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, GripVertical } from 'lucide-react'

// Kiểu dữ liệu specs
type SpecItem = {
  key: string
  value: string
}

interface Props {
  specs: SpecItem[]
  setSpecs: (s: SpecItem[]) => void
}

export default function SpecsManager({ specs, setSpecs }: Props) {
  const addSpec = () => {
    setSpecs([...specs, { key: '', value: '' }])
  }

  const removeSpec = (index: number) => {
    const newSpecs = [...specs]
    newSpecs.splice(index, 1)
    setSpecs(newSpecs)
  }

  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = val
    setSpecs(newSpecs)
  }

  return (
    <div className="space-y-4">
      {specs.map((spec, idx) => (
        <div key={idx} className="flex gap-3 items-center group">
          <GripVertical className="text-gray-300 w-4 h-4 cursor-move" />

          <Input
            placeholder="Tên thông số (VD: Chip, RAM)"
            value={spec.key}
            onChange={(e) => updateSpec(idx, 'key', e.target.value)}
            className="flex-1"
          />

          <Input
            placeholder="Giá trị (VD: A17 Pro, 8GB)"
            value={spec.value}
            onChange={(e) => updateSpec(idx, 'value', e.target.value)}
            className="flex-1"
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeSpec(idx)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <Button
        onClick={addSpec}
        variant="outline"
        className="w-full border-dashed text-gray-500 hover:text-gray-700"
      >
        <Plus className="w-4 h-4 mr-2" /> Thêm thông số kỹ thuật
      </Button>
    </div>
  )
}

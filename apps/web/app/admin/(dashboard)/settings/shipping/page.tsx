/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/src/lib/api'
import { Button } from '@/components/ui/button'
import GlassCard from '@/src/components/admin/GlassCard'
import { Switch } from '@/components/ui/switch'
import ShippingRuleModal from './shipping-rule-modal'
import { toast } from 'sonner'

/* dnd-kit imports */
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'
import SortableItem from '@/src/components/dnd/sortable-item'
import { Plus } from 'lucide-react'

export type ShippingRule = {
  _id: string
  type:
    | 'flat'
    | 'free_over'
    | 'location_based'
    | 'weight_based'
    | 'district_based'
  name: string
  amount?: number
  threshold?: number
  areas?: string[]
  minWeight?: number
  maxWeight?: number

  province?: { code: string; name: string }
  districts?: Array<{ code: string; name: string }>

  isActive: boolean
}

export default function ShippingSettingsPage() {
  const [selectedRule, setSelectedRule] = useState<ShippingRule | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const [rules, setRules] = useState<ShippingRule[]>([])

  const { data, refetch } = useQuery<ShippingRule[]>({
    queryKey: ['shipping-rules'],
    queryFn: async () => {
      const res = await api.get('/admin/shipping-rules')
      return res.data as ShippingRule[]
    }
  })

  /** SYNC SERVER → LOCAL */
  useEffect(() => {
    if (data) setRules([...data])
  }, [data])

  /** TOGGLE ACTIVE */
  const toggleMutation = useMutation({
    mutationFn: async (rule: ShippingRule) => {
      const res = await api.put(`/admin/shipping-rules/${rule._id}`, {
        ...rule,
        isActive: !rule.isActive
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Cập nhật thành công')
      refetch()
    }
  })

  /** DELETE RULE */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/shipping-rules/${id}`)
    },
    onSuccess: () => {
      toast.success('Đã xóa')
      refetch()
    }
  })

  /** REORDER */
  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await api.put('/admin/shipping-rules/reorder', { orderedIds })
    },
    onSuccess: () => {
      toast.success('Đã lưu thứ tự')
      refetch()
    }
  })

  /** DND sensors */
  const sensors = useSensors(useSensor(PointerSensor))

  const onDragEnd = (event: any) => {
    const { active, over } = event
    if (!over) return

    if (active.id !== over.id) {
      const oldIndex = rules.findIndex((r) => r._id === active.id)
      const newIndex = rules.findIndex((r) => r._id === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      const newOrder = arrayMove(rules, oldIndex, newIndex)
      setRules(newOrder)

      reorderMutation.mutate(newOrder.map((r) => r._id))
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold dark:text-gray-900">
            Phí vận chuyển
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Thiết lập phí vận chuyển nâng cao cho cửa hàng.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm rule
        </Button>
      </div>

      <div className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={rules.map((r) => r._id)}
            strategy={verticalListSortingStrategy}
          >
            {rules.map((rule) => (
              <SortableItem key={rule._id} id={rule._id}>
                <GlassCard>
                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>

                      <p className="text-sm text-muted-foreground mt-1">
                        {rule.type === 'flat' &&
                          `Phí cố định: ${rule.amount?.toLocaleString()}đ`}

                        {rule.type === 'free_over' &&
                          `Free ship cho đơn trên ${rule.threshold?.toLocaleString()}đ`}

                        {rule.type === 'location_based' &&
                          `Tỉnh/Thành: ${rule.areas?.join(
                            ', '
                          )} — ${rule.amount?.toLocaleString()}đ`}

                        {rule.type === 'weight_based' &&
                          `${rule.minWeight}g → ${
                            rule.maxWeight
                          }g — ${rule.amount?.toLocaleString()}đ`}

                        {rule.type === 'district_based' &&
                          (() => {
                            const province = rule.province
                            const districts = rule.districts || []

                            const provinceName =
                              province?.name || '(Chưa có tỉnh)'
                            const districtNames =
                              districts.length > 0
                                ? districts.map((d) => d.name).join(', ')
                                : '(Chưa có quận)'

                            return `${provinceName}: ${districtNames} — ${rule.amount?.toLocaleString()}đ`
                          })()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => toggleMutation.mutate(rule)}
                      />

                      <Button
                        variant="outline"
                        onClick={() => setSelectedRule(rule)}
                      >
                        Sửa
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(rule._id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* SINGLE MODAL for both create + edit */}
      <ShippingRuleModal
        open={createOpen || !!selectedRule}
        rule={selectedRule}
        onClose={() => {
          setCreateOpen(false)
          setSelectedRule(null)
        }}
        onSaved={() => {
          refetch()
          setCreateOpen(false)
          setSelectedRule(null)
        }}
      />
    </div>
  )
}

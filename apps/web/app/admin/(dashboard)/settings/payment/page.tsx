'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/src/lib/api'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import GlassCard from '@/src/components/admin/GlassCard'
import { useState } from 'react'
import { toast } from 'sonner'
import PaymentMethodConfigModal from './payment-method-config-modal'

// ICONS
import { Truck, Landmark } from 'lucide-react'

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

export default function PaymentMethodsPage() {
  const [selectedMethod, setSelectedMethod] = useState<any>(null)

  const sensors = useSensors(useSensor(PointerSensor))

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const res = await api.get('/admin/payment-methods')
      return res.data
    }
  })

  const toggleMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await api.patch(`/admin/payment-methods/${key}/toggle`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Cập nhật thành công!')
      refetch()
    },
    onError: () => toast.error('Không thể cập nhật phương thức')
  })

  const reorderMutation = useMutation({
    mutationFn: async (orderedKeys: string[]) => {
      await api.put('/admin/payment-methods/reorder', { orderedKeys })
    },
    onSuccess: () => {
      toast.success('Sắp xếp thành công!')
      refetch()
    }
  })

  if (isLoading)
    return <p className="p-6 text-gray-600 dark:text-gray-300">Đang tải...</p>

  const onDragEnd = (event: any) => {
    const { active, over } = event
    if (!over) return

    if (active.id !== over.id) {
      const oldIndex = data.findIndex((x: any) => x.key === active.id)
      const newIndex = data.findIndex((x: any) => x.key === over.id)

      const newOrder = arrayMove(data, oldIndex, newIndex)
      reorderMutation.mutate(newOrder.map((m: any) => m.key))
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold dark:text-gray-900">
            Phương thức thanh toán
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Bật/tắt và cấu hình các phương thức thanh toán cho cửa hàng.
          </p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={data?.map((m: any) => m.key)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {data?.map((item: any) => (
              <SortableItem key={item.key} id={item.key}>
                <GlassCard className="p-0">
                  <div className="flex items-center justify-between p-6">
                    {/* LEFT SECTION */}
                    <div className="flex items-center gap-4">
                      {/* ICONS */}
                      {item.key === 'cod' && (
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                          <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}

                      {item.key === 'bank' && (
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30">
                          <Landmark className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      )}

                      {item.key === 'momo' && (
                        <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-900/30">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                            alt="momo"
                            className="h-6 w-6 rounded"
                          />
                        </div>
                      )}

                      {item.key === 'stripe' && (
                        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                          <img
                            src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/stripe.svg"
                            alt="stripe"
                            className="h-6 w-6 rounded"
                          />
                        </div>
                      )}

                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          {item.key === 'cod' && 'Thanh toán khi nhận hàng.'}
                          {item.key === 'bank' &&
                            'Khách chuyển khoản trước khi giao hàng.'}
                          {item.key === 'stripe' &&
                            'Thanh toán qua thẻ Visa/Master bằng Stripe.'}
                          {item.key === 'momo' && 'Ví điện tử MoMo.'}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={() => toggleMutation.mutate(item.key)}
                      />

                      <Button
                        variant="outline"
                        onClick={() => setSelectedMethod(item)}
                        className="min-w-[100px]"
                      >
                        Cấu hình
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <PaymentMethodConfigModal
        method={selectedMethod}
        onClose={() => setSelectedMethod(null)}
        onUpdated={() => refetch()}
      />
    </div>
  )
}

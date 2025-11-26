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

  if (isLoading) return <p>Đang tải...</p>

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
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">Phương thức thanh toán</h1>
      <p className="text-muted-foreground">
        Bật/tắt và cấu hình các phương thức thanh toán cho cửa hàng.
      </p>

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
                <GlassCard>
                  <div className="flex items-center justify-between py-4">
                    {/* LEFT SECTION: Drag handle + icon + text */}
                    <div className="flex items-center gap-4">
                      {/* DRAG HANDLE */}
                      <div
                        className="cursor-grab p-2 rounded-md hover:bg-gray-100"
                        {...item.listeners}
                        {...item.attributes}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6h.01M14 6h.01M10 12h.01M14 12h.01M10 18h.01M14 18h.01"
                          />
                        </svg>
                      </div>

                      {/* ICONS */}
                      {item.key === 'cod' && (
                        <div className="p-2 rounded-lg bg-blue-50">
                          <Truck className="h-6 w-6 text-blue-600" />
                        </div>
                      )}

                      {item.key === 'bank' && (
                        <div className="p-2 rounded-lg bg-green-50">
                          <Landmark className="h-6 w-6 text-green-600" />
                        </div>
                      )}

                      {item.key === 'momo' && (
                        <img
                          src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                          alt="momo"
                          className="h-8 w-8 rounded"
                        />
                      )}

                      {item.key === 'stripe' && (
                        <img
                          src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/stripe.svg"
                          alt="stripe"
                          className="h-8 w-8 rounded"
                        />
                      )}

                      <div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.key === 'cod' && 'Thanh toán khi nhận hàng.'}
                          {item.key === 'bank' &&
                            'Khách chuyển khoản trước khi giao hàng.'}
                          {item.key === 'stripe' &&
                            'Thanh toán qua thẻ Visa/Master bằng Stripe.'}
                          {item.key === 'momo' && 'Ví điện tử MoMo.'}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT: toggle + config */}
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={() => toggleMutation.mutate(item.key)}
                      />

                      <Button
                        variant="outline"
                        onClick={() => setSelectedMethod(item)}
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

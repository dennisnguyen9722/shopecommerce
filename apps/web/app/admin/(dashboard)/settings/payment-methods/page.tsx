'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/src/lib/api'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import GlassCard from '@/src/components/admin/GlassCard'
import { useState } from 'react'
import { toast } from 'sonner'

import PaymentMethodConfigModal from '@/app/admin/(dashboard)/settings/payment-methods/payment-method-config-modal'

export default function PaymentMethodsPage() {
  const [selectedMethod, setSelectedMethod] = useState<any>(null)

  // GET ALL METHODS
  const { data, refetch, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const res = await api.get('/admin/payment-methods')
      return res.data
    }
  })

  // TOGGLE METHOD
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

  if (isLoading) return <p>Đang tải...</p>

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">Phương thức thanh toán</h1>
      <p className="text-muted-foreground">
        Bật/tắt và cấu hình các phương thức thanh toán cho cửa hàng.
      </p>

      <div className="space-y-4">
        {data?.map((item: any) => (
          <GlassCard key={item.key}>
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.key === 'cod' && 'Thanh toán khi nhận hàng.'}
                  {item.key === 'bank' &&
                    'Khách chuyển khoản trước khi giao hàng.'}
                  {item.key === 'stripe' &&
                    'Thanh toán qua thẻ Visa/Master bằng Stripe.'}
                  {item.key === 'momo' && 'Ví điện tử Momo.'}
                </p>
              </div>

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
        ))}
      </div>

      {/* CONFIG MODAL */}
      <PaymentMethodConfigModal
        method={selectedMethod}
        onClose={() => setSelectedMethod(null)}
        onUpdated={() => refetch()}
      />
    </div>
  )
}

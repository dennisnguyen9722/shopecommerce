/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMutation } from '@tanstack/react-query'
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

export default function PaymentMethodConfigModal({
  method,
  onClose,
  onUpdated
}: {
  method: any
  onClose: () => void
  onUpdated: () => void
}) {
  const [config, setConfig] = useState<any>({})

  useEffect(() => {
    if (method) setConfig(method.config || {})
  }, [method])

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/admin/payment-methods/${method.key}`, {
        config,
        enabled: method.enabled
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Đã cập nhật!')
      onUpdated()
      onClose()
    },
    onError: () => toast.error('Lỗi khi cập nhật!')
  })

  if (!method) return null

  return (
    <Dialog open={!!method} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cấu hình: {method.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {method.key === 'bank' && (
            <>
              <Input
                placeholder="Tên ngân hàng"
                value={config.bankName || ''}
                onChange={(e) =>
                  setConfig({ ...config, bankName: e.target.value })
                }
              />
              <Input
                placeholder="Chủ tài khoản"
                value={config.accountName || ''}
                onChange={(e) =>
                  setConfig({ ...config, accountName: e.target.value })
                }
              />
              <Input
                placeholder="Số tài khoản"
                value={config.accountNumber || ''}
                onChange={(e) =>
                  setConfig({ ...config, accountNumber: e.target.value })
                }
              />
              <Input
                placeholder="Chi nhánh"
                value={config.branch || ''}
                onChange={(e) =>
                  setConfig({ ...config, branch: e.target.value })
                }
              />
            </>
          )}

          {method.key === 'stripe' && (
            <>
              <Input
                placeholder="Publishable Key"
                value={config.publishableKey || ''}
                onChange={(e) =>
                  setConfig({ ...config, publishableKey: e.target.value })
                }
              />
              <Input
                placeholder="Secret Key"
                value={config.secretKey || ''}
                onChange={(e) =>
                  setConfig({ ...config, secretKey: e.target.value })
                }
              />
            </>
          )}

          {method.key === 'momo' && (
            <>
              <Input
                placeholder="Partner Code"
                value={config.partnerCode || ''}
                onChange={(e) =>
                  setConfig({ ...config, partnerCode: e.target.value })
                }
              />
              <Input
                placeholder="Access Key"
                value={config.accessKey || ''}
                onChange={(e) =>
                  setConfig({ ...config, accessKey: e.target.value })
                }
              />
              <Input
                placeholder="Secret Key"
                value={config.secretKey || ''}
                onChange={(e) =>
                  setConfig({ ...config, secretKey: e.target.value })
                }
              />
            </>
          )}

          {method.key === 'cod' && (
            <p className="text-sm text-muted-foreground">
              COD không có phần cấu hình thêm.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Ticket, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CouponInputProps {
  subtotal: number
  customerEmail?: string
  onApplyCoupon: (couponData: any) => void
  onRemoveCoupon: () => void
  appliedCoupon: any
}

export default function CouponInput({
  subtotal,
  customerEmail,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/public/orders/validate-coupon`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            couponCode: couponCode.toUpperCase(),
            subtotal,
            customerEmail
          })
        }
      )

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Mã giảm giá không hợp lệ')
        return
      }

      if (data.valid) {
        onApplyCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          type: data.type,
          description: data.coupon?.description
        })

        toast.success(`Áp dụng mã giảm giá: ${data.code}`)
        setCouponCode('')
      }
    } catch (error: any) {
      console.error('Validate coupon error:', error)
      toast.error(error?.message || 'Lỗi khi kiểm tra mã giảm giá')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {!appliedCoupon && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Nhập mã giảm giá"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleValidateCoupon()}
              className="pl-10 uppercase"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleValidateCoupon}
            disabled={loading || !couponCode.trim()}
            variant="outline"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
          </Button>
        </div>
      )}

      {appliedCoupon && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <Ticket className="w-4 h-4 text-green-600" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600 text-white font-mono font-bold">
                    {appliedCoupon.code}
                  </Badge>
                  <span className="text-sm text-green-700">
                    -{appliedCoupon.discountAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>

                {appliedCoupon.description && (
                  <p className="text-xs text-green-600 mt-1">
                    {appliedCoupon.description}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onRemoveCoupon}
              className="text-green-600 hover:text-green-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

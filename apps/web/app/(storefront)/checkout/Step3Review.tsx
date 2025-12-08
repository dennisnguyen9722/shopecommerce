'use client'

import { useCart } from '@/app/contexts/CartContext'
import serverApi from '@/src/lib/serverApi'
import { loyaltyApi } from '@/src/services/loyalty'
import React, { useEffect, useState } from 'react'
import { Loader2, Tag, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import CouponInput from './CouponInput'

interface Step3Props {
  back: () => void
  address: { name: string; email: string; phone: string; address: string }
  payment: string
}

export default function Step3Confirm({ back, address, payment }: Step3Props) {
  const { cart, totalPrice, clearCart } = useCart()

  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null)
  const [checkingVoucher, setCheckingVoucher] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  const discountAmount =
    appliedCoupon?.discountAmount || appliedVoucher?.discountAmount || 0

  const finalTotal = Math.max(0, totalPrice - discountAmount)

  const handleApplyVoucher = async () => {
    if (appliedCoupon) {
      toast.error('Bạn đã áp dụng Coupon. Hãy xoá Coupon trước.')
      return
    }

    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã voucher')
      return
    }

    setCheckingVoucher(true)
    try {
      const res = await loyaltyApi.validateVoucher(
        voucherCode,
        totalPrice,
        address.email
      )

      const data = (res as any).data || res

      if (data.valid) {
        setAppliedVoucher(data)
        toast.success(`Đã áp dụng voucher: ${data.code}`)
      } else {
        toast.error(data.error || 'Mã voucher không hợp lệ')
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          'Mã voucher không hợp lệ'
      )
    } finally {
      setCheckingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherCode('')
  }

  const handleApplyCoupon = (coupon: any) => {
    if (appliedVoucher) {
      toast.error('Bạn đã áp dụng Voucher. Hãy xoá Voucher trước.')
      return
    }

    setAppliedCoupon(coupon)
    toast.success(`Đã áp dụng Coupon: ${coupon.code}`)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
  }

  const [loading, setLoading] = useState(false)

  const placeOrder = async () => {
    setLoading(true)

    try {
      const payload = {
        customerName: address.name,
        customerEmail: address.email,
        customerPhone: address.phone,
        customerAddress: address.address,
        paymentMethod: payment,

        items: cart.map((i) => ({
          productId: i._id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
          slug: i.slug
        })),

        subtotal: totalPrice,
        shippingFee: 0,
        discount: discountAmount,
        totalPrice: finalTotal,

        voucherCode: appliedVoucher?.code || null,
        couponCode: appliedCoupon?.code || null
      }

      const { data } = await serverApi.post('/public/orders', payload)

      clearCart()

      toast.success('Đặt hàng thành công 🎉')

      const orderId = data.data?._id || data._id
      window.location.href = '/orders/' + orderId
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Không thể đặt hàng!')
    } finally {
      setLoading(false)
    }
  }

  const paymentLabels: Record<string, string> = {
    cod: 'Tiền mặt (COD)',
    bank: 'Chuyển khoản',
    momo: 'Ví MoMo'
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 !text-gray-900">
        Xác nhận đơn hàng
      </h2>

      {/* Thông tin giao hàng */}
      <div className="p-5 !bg-gray-50 rounded-xl mb-6 border border-gray-200">
        <h3 className="font-semibold mb-3 !text-gray-900">
          Thông tin giao hàng
        </h3>

        <div className="text-sm space-y-1.5 !text-gray-700">
          <p>
            <span className="font-medium">Người nhận:</span> {address.name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {address.email}
          </p>
          <p>
            <span className="font-medium">SĐT:</span> {address.phone}
          </p>
          <p>
            <span className="font-medium">Địa chỉ:</span> {address.address}
          </p>
          <p>
            <span className="font-medium">Thanh toán:</span>{' '}
            {paymentLabels[payment]}
          </p>
        </div>
      </div>

      {/* Sản phẩm */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 !bg-white">
        <div className="!bg-gray-50 px-4 py-3 font-semibold border-b border-gray-200 !text-gray-900">
          Sản phẩm ({cart.length})
        </div>
        <div className="p-4 space-y-3">
          {cart.map((i) => (
            <div
              key={i._id}
              className="flex justify-between text-sm items-center"
            >
              <div className="flex gap-3 items-center">
                <img
                  src={i.image}
                  className="w-12 h-12 rounded border border-gray-200 object-cover"
                  alt=""
                />
                <div>
                  <p className="font-medium !text-gray-900">{i.name}</p>
                  <p className="text-xs !text-gray-500">SL: {i.quantity}</p>
                </div>
              </div>
              <span className="font-semibold !text-gray-900">
                {(i.price * i.quantity).toLocaleString('vi-VN')}₫
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon */}
      <div className="border border-gray-200 rounded-xl p-4 mb-4 !bg-white">
        <h3 className="font-semibold mb-3 !text-gray-900">
          Mã giảm giá (Coupon)
        </h3>
        <CouponInput
          subtotal={totalPrice}
          customerEmail={address.email}
          appliedCoupon={appliedCoupon}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
        />
      </div>

      {/* Voucher */}
      <div className="border border-gray-200 rounded-xl p-4 mb-6 !bg-white">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="text-indigo-600" size={18} />
          <span className="font-semibold text-sm !text-gray-900">
            Voucher (Thành viên)
          </span>
        </div>

        {!appliedVoucher ? (
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã voucher"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              className="!bg-white !text-gray-900 border-gray-300"
            />
            <Button
              onClick={handleApplyVoucher}
              disabled={checkingVoucher}
              variant="outline"
            >
              {checkingVoucher ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                'Áp dụng'
              )}
            </Button>
          </div>
        ) : (
          <div className="bg-green-50 p-3 rounded border border-green-200 flex justify-between">
            <div>
              <p className="font-bold text-green-700">{appliedVoucher.code}</p>
              <p className="text-xs text-green-600">
                Giảm: {discountAmount.toLocaleString('vi-VN')}₫
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveVoucher}
              className="text-red-500"
            >
              <X size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* Tổng tiền */}
      <div className="bg-orange-50 p-5 rounded-xl border border-orange-200">
        <div className="mb-4 text-sm space-y-2">
          <div className="flex justify-between !text-gray-700">
            <span>Tạm tính:</span>
            <span className="font-semibold">
              {totalPrice.toLocaleString('vi-VN')}₫
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Giảm giá:</span>
              <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-orange-200">
          <span className="text-lg font-semibold !text-gray-900">
            Tổng thanh toán:
          </span>
          <span className="text-2xl text-orange-600 font-bold">
            {finalTotal.toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={back}
          className="flex-1 px-5 py-3 !bg-white !text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Quay lại
        </button>

        <button
          onClick={placeOrder}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            'Đặt hàng'
          )}
        </button>
      </div>
    </div>
  )
}

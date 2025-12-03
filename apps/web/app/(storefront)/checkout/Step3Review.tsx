'use client'

import { useCart } from '@/app/contexts/CartContext'
import serverApi from '@/src/lib/serverApi'
import { loyaltyApi } from '@/src/services/loyalty'
import React, { useState } from 'react'
import { Loader2, Tag, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Step3Props {
  back: () => void
  address: {
    name: string
    email: string
    phone: string
    address: string
  }
  payment: string
}

export default function Step3Confirm({ back, address, payment }: Step3Props) {
  const { cart, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)

  // --- 🎫 LOYALTY STATE ---
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null)
  const [checkingVoucher, setCheckingVoucher] = useState(false)

  // Tính toán số tiền cuối cùng
  // Backend trả về 'discountAmount'
  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0
  const finalTotal = Math.max(0, totalPrice - discountAmount)

  // Xử lý áp dụng voucher
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá')
      return
    }

    setCheckingVoucher(true)
    try {
      const res = await loyaltyApi.validateVoucher(
        voucherCode,
        totalPrice,
        address.email
      )

      // 👇 KHẮC PHỤC LỖI TYPE Ở ĐÂY
      // Nếu API trả về dạng { success: true, data: {...} } thì lấy res.data
      // Nếu API trả về trực tiếp data thì lấy res
      // Dùng (res as any) để tạm thời bypass check type chặt chẽ nếu cần
      const voucherData = (res as any).data || res

      if (voucherData && voucherData.valid) {
        setAppliedVoucher(voucherData)
        toast.success(`Đã áp dụng mã: ${voucherData.code}`)
      }
    } catch (error: any) {
      console.error(error)
      setAppliedVoucher(null)
      toast.error(error.response?.data?.error || 'Mã voucher không hợp lệ')
    } finally {
      setCheckingVoucher(false)
    }
  }

  // Xử lý xóa voucher
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherCode('')
    toast.info('Đã gỡ bỏ mã giảm giá')
  }

  // Xử lý Đặt hàng
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

        // Lấy code từ appliedVoucher (đã lưu đúng data ở trên)
        voucherCode: appliedVoucher ? appliedVoucher.code : null,

        discount: discountAmount,
        totalPrice: finalTotal
      }

      const { data } = await serverApi.post('/public/orders', payload)

      clearCart()
      toast.success('Đặt hàng thành công! 🎉')

      // Chuyển hướng
      // Kiểm tra cấu trúc data trả về khi tạo đơn (có thể cũng bọc trong .data)
      const orderId = data.data?._id || data._id || data.data?.id
      window.location.href = '/orders/' + orderId
    } catch (err: any) {
      console.error(err)
      toast.error(
        err.response?.data?.error || 'Không thể đặt hàng, vui lòng thử lại!'
      )
    } finally {
      setLoading(false)
    }
  }

  const paymentLabels: Record<string, string> = {
    cod: 'Tiền mặt (COD)',
    bank: 'Chuyển khoản ngân hàng',
    momo: 'Ví MoMo'
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Xác nhận đơn hàng</h2>

      {/* Thông tin khách hàng */}
      <div className="p-5 bg-gray-50 rounded-xl space-y-3 mb-6 border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">
          Thông tin giao hàng
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="w-32 text-gray-500">Người nhận:</span>
            <span className="font-medium text-gray-900">{address.name}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-500">Email:</span>
            <span className="font-medium text-gray-900">{address.email}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-500">SĐT:</span>
            <span className="font-medium text-gray-900">{address.phone}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-500">Địa chỉ:</span>
            <span className="font-medium text-gray-900 flex-1">
              {address.address}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-500">Thanh toán:</span>
            <span className="font-medium text-orange-600">
              {paymentLabels[payment] || payment}
            </span>
          </div>
        </div>
      </div>

      {/* Sản phẩm */}
      <div className="border rounded-xl overflow-hidden mb-6">
        <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-700 border-b">
          Sản phẩm đã đặt ({cart.length})
        </div>
        <div className="p-4 space-y-3 bg-white">
          {cart.map((i) => (
            <div
              key={i._id}
              className="flex justify-between items-center text-sm"
            >
              <div className="flex-1 flex items-center gap-3">
                {i.image && (
                  <img
                    src={i.image}
                    alt={i.name}
                    className="w-10 h-10 object-cover rounded border"
                  />
                )}
                <div>
                  <span className="font-medium block">{i.name}</span>
                  <span className="text-gray-500 text-xs">
                    SL: {i.quantity}
                  </span>
                </div>
              </div>
              <span className="font-semibold">
                {(i.price * i.quantity).toLocaleString('vi-VN')}₫
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* --- 🎫 PHẦN NHẬP VOUCHER --- */}
      <div className="border rounded-xl p-4 bg-white mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="text-indigo-600" size={18} />
          <span className="font-semibold text-sm">Mã ưu đãi / Voucher</span>
        </div>

        {!appliedVoucher ? (
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã giảm giá"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              className="uppercase font-mono"
            />
            <Button
              onClick={handleApplyVoucher}
              disabled={checkingVoucher || !voucherCode}
              variant="outline"
              className="min-w-[100px]"
            >
              {checkingVoucher ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                'Áp dụng'
              )}
            </Button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center animate-in fade-in">
            <div>
              <p className="text-sm font-bold text-green-700 flex items-center gap-2">
                <Tag size={14} />{' '}
                {appliedVoucher.reward?.name || appliedVoucher.code}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Đã giảm:{' '}
                <span className="font-bold">
                  {discountAmount.toLocaleString('vi-VN')}₫
                </span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveVoucher}
              className="text-red-500 hover:text-red-700 hover:bg-red-100 h-8 w-8 rounded-full"
            >
              <X size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* --- TỔNG KẾT TIỀN --- */}
      <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
        <div className="space-y-2 mb-4 text-sm text-gray-600 border-b border-orange-200 pb-4">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
          </div>
          {appliedVoucher && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Voucher giảm giá:</span>
              <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">
            Tổng thanh toán:
          </span>
          <div className="text-right">
            <span className="text-2xl font-bold text-orange-600 block">
              {finalTotal.toLocaleString('vi-VN')}₫
            </span>
            {appliedVoucher && (
              <span className="text-xs text-gray-500 line-through">
                {totalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 bg-white/60 p-2 rounded text-xs text-center text-orange-800 flex items-center justify-center gap-1">
          ✨ Hoàn thành đơn hàng để tích điểm thành viên
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-8 gap-4">
        <button
          onClick={back}
          disabled={loading}
          className="flex-1 px-5 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
        >
          Quay lại
        </button>

        <button
          onClick={placeOrder}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-200"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            'Xác nhận & Đặt hàng'
          )}
        </button>
      </div>
    </div>
  )
}

'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import serverApi from '@/src/lib/api'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const formatCurrency = (n: number) => n?.toLocaleString('vi-VN') + ' ₫'

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Chờ xử lý',
        color: 'bg-yellow-100 text-yellow-700',
        icon: Clock
      }
    case 'processing':
      return {
        label: 'Đang xử lý',
        color: 'bg-blue-100 text-blue-700',
        icon: Package
      }
    case 'shipped':
      return {
        label: 'Đang giao',
        color: 'bg-purple-100 text-purple-700',
        icon: Truck
      }
    case 'completed':
      return {
        label: 'Hoàn thành',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle2
      }
    case 'cancelled':
      return {
        label: 'Đã hủy',
        color: 'bg-red-100 text-red-700',
        icon: XCircle
      }
    default:
      return {
        label: status,
        color: 'bg-gray-100 text-gray-700',
        icon: Package
      }
  }
}

const paymentMethodLabels: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  vnpay: 'VNPay'
}

export default function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: async () => {
      const res = await serverApi.get(`/public/orders/${id}`)
      return res.data
    },
    enabled: !!id
  })

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
      </div>
    )

  if (!order)
    return (
      <div className="text-center py-20 text-gray-500">
        Không tìm thấy đơn hàng
      </div>
    )

  const status = getStatusInfo(order.status)
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/profile/orders">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Đơn hàng #{order._id.slice(-6).toUpperCase()}
            </h2>
            <div className="text-sm text-gray-500">
              Đặt lúc:{' '}
              {format(new Date(order.createdAt), 'HH:mm - dd/MM/yyyy', {
                locale: vi
              })}
            </div>
          </div>
        </div>

        <Badge
          className={`${status.color} border-0 px-3 py-1.5 text-sm flex items-center gap-1.5 w-fit`}
        >
          <StatusIcon size={14} /> {status.label}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT COLUMN: ITEMS */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-900 bg-gray-50/50">
              Danh sách sản phẩm
            </div>
            <div className="p-6 space-y-6">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 relative">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 line-clamp-2">
                      {item.name}
                    </h4>
                    {/* Hiển thị Variant Info */}
                    {item.variantInfo && (
                      <div className="text-sm text-gray-500 mt-1 space-x-2">
                        {item.variantInfo.color && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                            {item.variantInfo.color}
                          </span>
                        )}
                        {item.variantInfo.size && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                            {item.variantInfo.size}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm text-gray-500">
                        x{item.quantity}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INFO & SUMMARY */}
        <div className="space-y-6">
          {/* Thông tin giao hàng */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-orange-500" /> Địa chỉ nhận hàng
            </h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">
                {order.customerName}
              </p>
              <p className="text-gray-500">{order.customerPhone}</p>
              <p className="mt-2 text-gray-600 leading-relaxed">
                {order.customerAddress}
              </p>
            </div>
          </div>

          {/* Thanh toán & Tổng tiền */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-500" /> Thanh toán
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
            </p>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}

              <Separator className="my-2" />

              <div className="flex justify-between items-center text-base font-bold text-gray-900 pt-1">
                <span>Tổng cộng</span>
                <span className="text-orange-600 text-xl">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

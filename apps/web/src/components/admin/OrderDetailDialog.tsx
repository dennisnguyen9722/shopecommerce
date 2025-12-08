'use client'

import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import api from '@/src/lib/api'
import ChangeStatus from './ChangeStatus'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { X } from 'lucide-react'

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

type OrderItem = {
  productId?: string
  name?: string
  slug?: string
  quantity: number
  price: number
  image?: string
}

type OrderData = {
  _id: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  paymentMethod?: string
  items?: OrderItem[]
  totalPrice?: number
  status?: OrderStatus
  createdAt?: string
}

const InvoicePDFClient = dynamic(
  () => import('@/src/components/admin/InvoicePDF.client'),
  { ssr: false }
)

function formatCurrency(n: any) {
  return typeof n === 'number' && !isNaN(n) ? n.toLocaleString('vi-VN') : '0'
}

function formatDateSafe(d?: string) {
  if (!d) return 'N/A'
  try {
    return format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: vi })
  } catch {
    return 'N/A'
  }
}

export default function OrderDetailDialog({
  orderId,
  onClose
}: {
  orderId: string | null
  onClose: () => void
}) {
  const [data, setData] = React.useState<OrderData | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!orderId) {
      setData(null)
      return
    }

    let mounted = true
    const fetchOrder = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/admin/orders/${orderId}`)
        if (!mounted) return
        setData(res.data as OrderData)
      } catch (err: any) {
        console.error('Fetch order error', err)
        setError(err?.response?.data?.error || 'Lỗi tải đơn hàng')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchOrder()

    return () => {
      mounted = false
    }
  }, [orderId])

  if (!orderId) return null

  return (
    <RadixDialog.Root
      open={!!orderId}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <RadixDialog.Portal>
        {/* Overlay với fade in/out */}
        <RadixDialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Content - Slide from right */}
        <RadixDialog.Content className="fixed right-0 top-0 h-full z-[9999] bg-white dark:bg-gray-900 flex flex-col max-h-screen overflow-hidden w-full md:w-[700px] lg:w-[900px] shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300">
          <RadixDialog.Title className="sr-only">
            {`Chi tiết đơn hàng ${orderId}`}
          </RadixDialog.Title>

          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chi tiết đơn hàng #{orderId.slice(-6)}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {data ? formatDateSafe(data.createdAt) : ''}
              </p>
            </div>

            <RadixDialog.Close asChild>
              <button
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </RadixDialog.Close>
          </header>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-950">
            {loading ? (
              <div className="py-40 text-center text-gray-500 dark:text-gray-400">
                <div className="mx-auto mb-4 h-10 w-10 rounded-full border-b-2 border-orange-500 dark:border-orange-400 animate-spin" />
                Đang tải chi tiết đơn hàng...
              </div>
            ) : error ? (
              <div className="py-20 text-center text-red-600 dark:text-red-400 font-medium">
                {error}
              </div>
            ) : data ? (
              <div className="space-y-8">
                {/* Customer & Order Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                      Thông tin khách hàng
                    </h3>
                    <div className="text-sm space-y-2">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          Họ tên
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {data.customerName || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          Email
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {data.customerEmail || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          Số điện thoại
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {data.customerPhone || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          Địa chỉ giao
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {data.customerAddress || '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                      Thông tin đơn hàng
                    </h3>
                    <div className="text-sm space-y-3">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          Thanh toán
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {data.paymentMethod === 'cod'
                            ? 'Tiền mặt (COD)'
                            : data.paymentMethod === 'bank'
                            ? 'Chuyển khoản ngân hàng'
                            : data.paymentMethod === 'momo'
                            ? 'Ví MoMo'
                            : data.paymentMethod || '—'}
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                          Trạng thái
                        </div>
                        <ChangeStatus
                          orderId={orderId}
                          current={data.status || 'pending'}
                          onChanged={(v: OrderStatus) => {
                            setData((prev) =>
                              prev ? { ...prev, status: v } : prev
                            )
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* Items Table */}
                <section>
                  <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">
                    Sản phẩm đã đặt
                  </h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-semibold">
                            Ảnh
                          </th>
                          <th className="p-3 text-left text-gray-700 dark:text-gray-300 font-semibold">
                            Sản phẩm
                          </th>
                          <th className="p-3 text-center text-gray-700 dark:text-gray-300 font-semibold">
                            SL
                          </th>
                          <th className="p-3 text-right text-gray-700 dark:text-gray-300 font-semibold">
                            Đơn giá
                          </th>
                          <th className="p-3 text-right text-gray-700 dark:text-gray-300 font-semibold">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data.items || []).map((it, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="p-3">
                              <div className="w-14 h-14 relative rounded bg-gray-100 dark:bg-gray-900 overflow-hidden">
                                {it.image ? (
                                  <Image
                                    src={it.image}
                                    alt={it.name || ''}
                                    fill
                                    className="object-contain"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                                    No image
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {it.name || '—'}
                              </div>
                              {it.slug && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  SKU: {it.slug}
                                </div>
                              )}
                            </td>

                            <td className="p-3 text-center text-gray-900 dark:text-white">
                              {it.quantity}
                            </td>

                            <td className="p-3 text-right text-gray-900 dark:text-white">
                              {formatCurrency(it.price)}₫
                            </td>

                            <td className="p-3 text-right font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(
                                (it.price || 0) * (it.quantity || 0)
                              )}
                              ₫
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm min-w-[350px]">
                    <div className="flex justify-between items-center gap-4 mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tạm tính
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white text-right">
                        {formatCurrency(data.totalPrice || 0)}₫
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-4 mb-3">
                      <span className="text-gray-600 dark:text-gray-400">
                        Vận chuyển
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white text-right">
                        Miễn phí
                      </span>
                    </div>

                    <Separator className="my-3 dark:bg-gray-700" />

                    <div className="flex justify-between items-center gap-4 text-lg font-bold text-orange-600 dark:text-orange-400">
                      <span className="whitespace-nowrap">Tổng thanh toán</span>
                      <span className="text-right">
                        {formatCurrency(data.totalPrice || 0)}₫
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Notification */}
                {data.customerEmail && data.status === 'completed' && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Hóa đơn đã được gửi
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                        Email hóa đơn đã được gửi đến{' '}
                        <strong>{data.customerEmail}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-500 dark:text-gray-400">
                Không tìm thấy đơn hàng
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="px-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between flex-shrink-0">
            <div />
            <div className="flex items-center gap-3">
              {data && <InvoicePDFClient order={data} />}
              <RadixDialog.Close asChild>
                <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                  Đóng
                </button>
              </RadixDialog.Close>
            </div>
          </footer>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

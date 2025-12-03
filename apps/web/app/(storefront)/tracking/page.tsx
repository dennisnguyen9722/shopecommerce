'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { loyaltyApi } from '@/src/services/loyalty' // Import API
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Search,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  MapPin
} from 'lucide-react'
import { toast } from 'sonner'

export default function OrderTrackingPage() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: any) => {
    try {
      setLoading(true)
      setOrder(null) // Reset order cũ

      // Gọi API Track Order
      const res = await loyaltyApi.trackOrder(data.email, data.orderNumber)

      setOrder(res)
      toast.success('Đã tìm thấy đơn hàng!')
    } catch (error: any) {
      toast.error(
        'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại Email và Mã đơn.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Hàm hiển thị trạng thái đẹp hơn
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600 bg-yellow-100',
          label: 'Chờ xử lý',
          text: 'text-yellow-700'
        }
      case 'processing':
        return {
          icon: Package,
          color: 'text-blue-600 bg-blue-100',
          label: 'Đang chuẩn bị hàng',
          text: 'text-blue-700'
        }
      case 'shipping':
        return {
          icon: Truck,
          color: 'text-indigo-600 bg-indigo-100',
          label: 'Đang giao hàng',
          text: 'text-indigo-700'
        }
      case 'delivered':
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-100',
          label: 'Giao thành công',
          text: 'text-green-700'
        }
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-red-600 bg-red-100',
          label: 'Đã hủy',
          text: 'text-red-700'
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-600 bg-gray-100',
          label: status,
          text: 'text-gray-700'
        }
    }
  }

  return (
    <div className="container mx-auto py-16 px-4 max-w-2xl min-h-[60vh]">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3 text-gray-900">
          Tra cứu đơn hàng
        </h1>
        <p className="text-gray-500">
          Nhập email và mã đơn hàng để theo dõi tình trạng vận chuyển
        </p>
      </div>

      {/* --- FORM TRA CỨU --- */}
      <Card className="mb-8 shadow-md border-gray-200">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">
                  Email đặt hàng
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-11"
                  {...register('email', { required: true })}
                />
                {errors.email && (
                  <span className="text-xs text-red-500">
                    Vui lòng nhập email
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderNumber" className="font-medium">
                  Mã đơn hàng
                </Label>
                <Input
                  id="orderNumber"
                  placeholder="Ví dụ: 675..."
                  className="h-11"
                  {...register('orderNumber', { required: true })}
                />
                {errors.orderNumber && (
                  <span className="text-xs text-red-500">
                    Vui lòng nhập mã đơn
                  </span>
                )}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? (
                'Đang tìm kiếm...'
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Tra cứu ngay
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* --- KẾT QUẢ HIỂN THỊ --- */}
      {order && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 border-indigo-100 shadow-lg overflow-hidden">
          {/* Header kết quả */}
          <div className="bg-gray-50 px-6 py-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-lg">
                Đơn hàng #{order._id.slice(-6).toUpperCase()}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Ngày đặt:{' '}
                {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {(() => {
              const info = getStatusInfo(order.status)
              const Icon = info.icon
              return (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${info.color}`}
                >
                  <Icon size={18} /> {info.label}
                </div>
              )
            })()}
          </div>

          <CardContent className="pt-6 px-6">
            <div className="space-y-6">
              {/* Thông tin người nhận */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-500" /> Địa chỉ
                    nhận hàng
                  </h4>
                  <p className="text-sm text-gray-700 font-medium">
                    {order.customerName}
                  </p>
                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.customerAddress}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Package size={16} className="text-indigo-500" /> Thông tin
                    thanh toán
                  </h4>
                  <p className="text-sm text-gray-600">
                    Phương thức:{' '}
                    <span className="font-medium uppercase">
                      {order.paymentMethod}
                    </span>
                  </p>
                  {/* Hiển thị điểm tích lũy dự kiến */}
                  {['completed', 'delivered'].includes(order.status) ? (
                    <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle size={14} /> Đã tích điểm thành công
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded">
                      Sẽ tích điểm khi hoàn thành
                    </div>
                  )}
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div>
                <h4 className="font-semibold mb-4">
                  Sản phẩm ({order.items.length})
                </h4>
                <div className="space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-md border flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No Img</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-sm">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span>{order.subtotal?.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span>{order.shippingFee?.toLocaleString('vi-VN')}₫</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Giảm giá (Voucher)</span>
                    <span>-{order.discount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="font-bold text-xl text-indigo-600">
                    {order.totalPrice?.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

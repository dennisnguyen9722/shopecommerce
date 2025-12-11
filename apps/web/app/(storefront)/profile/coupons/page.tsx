'use client'

import { useQuery } from '@tanstack/react-query'
import serverApi from '@/src/lib/api'
import { toast } from 'sonner'
import { Ticket, Copy, Loader2, CalendarClock, Gift, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function MyCouponsPage() {
  // 🎁 Loyalty Vouchers (từ tích điểm)
  const { data: loyaltyVouchers = [], isLoading: loadingLoyalty } = useQuery({
    queryKey: ['loyalty-vouchers'],
    queryFn: async () => {
      const res = await serverApi.get('/public/loyalty/vouchers')
      return res.data
    }
  })

  // 🏷️ Public Coupons (mã công khai)
  const { data: publicCoupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: ['public-coupons'],
    queryFn: async () => {
      const res = await serverApi.get('/public/coupons')
      return res.data
    }
  })

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Đã sao chép mã: ' + code)
  }

  const isLoading = loadingLoyalty || loadingCoupons

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Kho Voucher của tôi
        </h2>
        <span className="text-sm text-gray-500">
          {loyaltyVouchers.length + publicCoupons.length} mã khả dụng
        </span>
      </div>

      <Tabs defaultValue="loyalty" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="loyalty" className="gap-2">
            <Gift size={16} />
            Voucher của tôi ({loyaltyVouchers.length})
          </TabsTrigger>
          <TabsTrigger value="public" className="gap-2">
            <Tag size={16} />
            Mã công khai ({publicCoupons.length})
          </TabsTrigger>
        </TabsList>

        {/* ========== TAB 1: LOYALTY VOUCHERS ========== */}
        <TabsContent value="loyalty" className="mt-6">
          {loyaltyVouchers.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="Chưa có voucher nào"
              description="Tích điểm để đổi voucher hấp dẫn!"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loyaltyVouchers.map((item: any) => {
                const reward = item.rewardId || item.reward
                return (
                  <VoucherCard
                    key={item._id}
                    code={item.voucherCode}
                    title={reward?.name || 'Voucher tích điểm'}
                    discount={getDiscountText(reward)}
                    description={reward?.description}
                    expiresAt={item.expiresAt}
                    status={item.status}
                    onCopy={copyToClipboard}
                    type="loyalty"
                  />
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ========== TAB 2: PUBLIC COUPONS ========== */}
        <TabsContent value="public" className="mt-6">
          {publicCoupons.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="Chưa có mã giảm giá công khai"
              description="Vui lòng quay lại sau!"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publicCoupons.map((coupon: any) => (
                <VoucherCard
                  key={coupon._id}
                  code={coupon.code}
                  title="Mã giảm giá"
                  discount={formatPublicDiscount(coupon)}
                  description={coupon.description}
                  expiresAt={coupon.endDate}
                  minOrderAmount={coupon.minOrderAmount}
                  maxDiscountAmount={coupon.maxDiscountAmount}
                  discountType={coupon.discountType}
                  onCopy={copyToClipboard}
                  type="public"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== HELPER COMPONENTS ====================

function VoucherCard({
  code,
  title,
  discount,
  description,
  expiresAt,
  status,
  minOrderAmount,
  maxDiscountAmount,
  discountType,
  onCopy,
  type
}: any) {
  const isExpired =
    status === 'expired' || (expiresAt && new Date(expiresAt) < new Date())
  const isUsed = status === 'used'

  return (
    <div
      className={`relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex ${
        isExpired || isUsed ? 'opacity-60' : ''
      }`}
    >
      {/* Left Side */}
      <div
        className={`${
          type === 'loyalty' ? 'bg-orange-500' : 'bg-blue-500'
        } w-24 flex flex-col items-center justify-center p-2 text-white border-r border-dashed border-white/30 relative`}
      >
        {type === 'loyalty' ? (
          <Gift size={28} className="mb-1" />
        ) : (
          <Tag size={28} className="mb-1" />
        )}
        <span className="font-bold text-xs text-center">
          {type === 'loyalty' ? 'REWARD' : 'COUPON'}
        </span>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-50 rounded-full"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gray-50 rounded-full"></div>
      </div>

      {/* Right Side */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{code}</h3>
              {isUsed && (
                <span className="text-xs text-red-500 font-medium">
                  Đã sử dụng
                </span>
              )}
              {isExpired && !isUsed && (
                <span className="text-xs text-gray-400 font-medium">
                  Hết hạn
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-orange-600"
              onClick={() => onCopy(code)}
              disabled={isExpired || isUsed}
            >
              <Copy size={16} />
            </Button>
          </div>
          <p
            className={`${
              type === 'loyalty' ? 'text-orange-600' : 'text-blue-600'
            } font-medium text-sm mt-1`}
          >
            {discount}
          </p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {description || 'Áp dụng cho đơn hàng'}
          </p>

          {/* Điều kiện */}
          {minOrderAmount > 0 && (
            <p className="text-xs text-blue-600 mt-2">
              Đơn tối thiểu: {minOrderAmount.toLocaleString('vi-VN')}₫
            </p>
          )}
          {discountType === 'percentage' && maxDiscountAmount > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Giảm tối đa: {maxDiscountAmount.toLocaleString('vi-VN')}₫
            </p>
          )}
        </div>

        {expiresAt && (
          <div className="mt-3 flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded w-fit">
            <CalendarClock size={12} />
            <span>
              HSD: {format(new Date(expiresAt), 'dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
      <Icon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  )
}

// ==================== HELPER FUNCTIONS ====================

function getDiscountText(reward: any) {
  if (!reward) return 'Ưu đãi đặc biệt'

  if (reward.type === 'discount_percentage') {
    return `Giảm ${reward.value}%`
  } else if (reward.type === 'discount_fixed') {
    return `Giảm ${Number(reward.value).toLocaleString('vi-VN')}₫`
  } else if (reward.type === 'free_shipping') {
    return 'Miễn phí vận chuyển'
  }
  return reward.name || 'Ưu đãi đặc biệt'
}

function formatPublicDiscount(coupon: any) {
  if (coupon.discountType === 'percentage') {
    return `Giảm ${coupon.discountValue}%`
  } else if (coupon.discountType === 'fixed') {
    return `Giảm ${coupon.discountValue?.toLocaleString('vi-VN')}₫`
  } else if (coupon.discountType === 'free_shipping') {
    return 'Miễn phí vận chuyển'
  }
  return 'Ưu đãi đặc biệt'
}

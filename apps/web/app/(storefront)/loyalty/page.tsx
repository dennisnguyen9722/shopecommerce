'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/store/authStore'
import { loyaltyApi } from '@/src/services/loyalty'
import { IReward, IPointHistory, IVoucher } from '@/types/loyalty'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Import Alert Dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Loader2, Gift, History, Ticket, Copy, Lock, Star } from 'lucide-react'
import { toast } from 'sonner'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    val
  )

export default function LoyaltyPage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser, logout } = useAuthStore()

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [rewards, setRewards] = useState<IReward[]>([])
  const [history, setHistory] = useState<IPointHistory[]>([])
  const [vouchers, setVouchers] = useState<IVoucher[]>([])

  // STATE QUẢN LÝ HỘP THOẠI
  const [selectedReward, setSelectedReward] = useState<IReward | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        router.push('/login')
      } else {
        fetchData()
      }
    }
  }, [mounted, isAuthenticated])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [dashRes, rewardRes, historyRes, voucherRes] = await Promise.all([
        loyaltyApi.getDashboard(),
        loyaltyApi.getRewards(),
        loyaltyApi.getHistory(),
        loyaltyApi.getMyVouchers('active')
      ])

      setDashboardData(dashRes)
      setRewards(rewardRes)
      setHistory(historyRes.items)
      setVouchers(voucherRes)

      if (user && dashRes.customer) {
        updateUser({
          loyaltyPoints: dashRes.customer.loyaltyPoints,
          loyaltyTier: dashRes.customer.loyaltyTier,
          totalSpent: dashRes.customer.totalSpent
        })
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn')
        logout()
        router.push('/login')
        return
      }
    } finally {
      setLoading(false)
    }
  }

  // KHI BẤM NÚT ĐỔI QUÀ
  const onRedeemClick = (reward: IReward) => {
    setSelectedReward(reward)
    setIsDialogOpen(true)
  }

  // KHI XÁC NHẬN ĐỔI
  const confirmRedeem = async () => {
    if (!selectedReward) return

    try {
      const res = await loyaltyApi.redeemReward(selectedReward._id)

      toast.success(`🎉 Đổi quà thành công! Mã: ${res.voucher.code}`)

      if (user) {
        updateUser({
          loyaltyPoints: user.loyaltyPoints - selectedReward.pointsRequired
        })
      }
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Đổi quà thất bại')
    } finally {
      setIsDialogOpen(false)
      setSelectedReward(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('📋 Đã sao chép mã voucher!')
  }

  if (!mounted || loading)
    return (
      <div className="flex justify-center items-center min-h-[500px] !bg-white">
        <Loader2 className="animate-spin text-orange-600" size={40} />
      </div>
    )

  const calculateProgress = () => {
    if (!dashboardData?.tierInfo?.spentNeeded) return 100
    const nextTierNeeded =
      dashboardData.tierInfo.spentNeeded + (user?.totalSpent || 0)
    const current = user?.totalSpent || 0
    if (nextTierNeeded === 0) return 100
    const percent = (current / nextTierNeeded) * 100
    return Math.min(Math.max(percent, 5), 95)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl !bg-white">
      {/* HEADER INFO */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold !text-white">
                Xin chào, {user?.name}
              </h1>
              <Badge className="bg-yellow-400 !text-black hover:bg-yellow-500 uppercase px-3 py-1 font-bold shadow-sm border-none">
                {user?.loyaltyTier || 'MEMBER'}
              </Badge>
            </div>
            <p className="text-orange-100 opacity-90">
              Cảm ơn bạn đã đồng hành cùng chúng tôi!
            </p>
          </div>
          <div className="text-center md:text-right bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10 min-w-[180px]">
            <p className="text-sm text-orange-100 mb-1">
              Điểm tích lũy hiện có
            </p>
            <div className="flex items-center justify-center md:justify-end gap-2">
              <Star className="fill-yellow-400 text-yellow-400" size={24} />
              <p className="text-4xl font-bold !text-white">
                {user?.loyaltyPoints?.toLocaleString() ?? 0}
              </p>
            </div>
          </div>
        </div>
        {dashboardData?.tierInfo?.nextTier && (
          <div className="mt-8">
            <div className="flex justify-between text-xs md:text-sm mb-2 text-orange-100 font-medium">
              <span>
                Tiến độ thăng hạng{' '}
                {dashboardData.tierInfo.nextTier.toUpperCase()}
              </span>
              <span>
                Còn thiếu {formatCurrency(dashboardData.tierInfo.spentNeeded)}
              </span>
            </div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden w-full backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1 bg-gray-100! rounded-xl border-0!">
          <TabsTrigger
            value="rewards"
            className="py-3 flex gap-2 rounded-lg text-gray-700! bg-transparent! data-[state=active]:bg-white! data-[state=active]:text-orange-600! data-[state=active]:shadow-sm hover:bg-gray-50!"
          >
            <Gift size={18} /> <span className="hidden sm:inline">Đổi quà</span>
          </TabsTrigger>
          <TabsTrigger
            value="vouchers"
            className="py-3 flex gap-2 rounded-lg text-gray-700! bg-transparent! data-[state=active]:bg-white! data-[state=active]:text-orange-600! data-[state=active]:shadow-sm hover:bg-gray-50!"
          >
            <Ticket size={18} />{' '}
            <span className="hidden sm:inline">Voucher của tôi</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="py-3 flex gap-2 rounded-lg text-gray-700! bg-transparent! data-[state=active]:bg-white! data-[state=active]:text-orange-600! data-[state=active]:shadow-sm hover:bg-gray-50!"
          >
            <History size={18} />{' '}
            <span className="hidden sm:inline">Lịch sử điểm</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="rewards"
          className="animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <Card
                key={reward._id}
                className="overflow-hidden hover:shadow-lg transition-all border-gray-200 group flex flex-col h-full !bg-white"
              >
                <div className="h-40 bg-orange-50 flex items-center justify-center relative shrink-0">
                  <div className="absolute top-3 right-3 bg-black/70 !text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm z-10">
                    {reward.pointsRequired} điểm
                  </div>
                  {reward.imageUrl ? (
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Gift
                      className="text-orange-300 group-hover:scale-110 transition-transform duration-300"
                      size={64}
                    />
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1 !text-gray-900">
                    {reward.name}
                  </CardTitle>
                  <p className="text-sm !text-gray-500 line-clamp-2 min-h-[40px]">
                    {reward.description}
                  </p>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex justify-between items-center mt-2">
                    {reward.canRedeem ? (
                      <Button
                        className="w-full bg-orange-600 hover:bg-orange-700 !text-white shadow-md hover:shadow-orange-200 transition-all"
                        onClick={() => onRedeemClick(reward)}
                      >
                        Đổi ngay
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        disabled
                        className="w-full opacity-70 cursor-not-allowed !bg-gray-100 !text-gray-500"
                      >
                        {reward.reason === 'Insufficient points' ? (
                          <>
                            <Lock size={14} className="mr-2" /> Thiếu điểm
                          </>
                        ) : (
                          reward.reason || 'Không khả dụng'
                        )}
                      </Button>
                    )}
                  </div>
                  {!reward.canRedeem &&
                    user &&
                    user.loyaltyPoints < reward.pointsRequired && (
                      <p className="text-xs !text-orange-500 mt-2 text-center font-medium">
                        Cần thêm{' '}
                        {(
                          reward.pointsRequired - user.loyaltyPoints
                        ).toLocaleString()}{' '}
                        điểm
                      </p>
                    )}
                </CardContent>
              </Card>
            ))}
            {rewards.length === 0 && (
              <div className="col-span-3 text-center py-10 !text-gray-500">
                Hiện chưa có quà tặng nào.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="vouchers"
          className="animate-in fade-in slide-in-from-bottom-2"
        >
          {vouchers.length === 0 ? (
            <div className="text-center py-12 !bg-gray-50 rounded-lg border border-dashed">
              <Ticket className="mx-auto h-12 w-12 !text-gray-300 mb-3" />
              <h3 className="text-lg font-medium !text-gray-900">
                Chưa có voucher nào
              </h3>
              <p className="!text-gray-500">
                Hãy tích điểm và đổi quà ngay nhé!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vouchers.map((voucher) => (
                <div
                  key={voucher._id}
                  className="border border-orange-200 rounded-lg p-4 flex justify-between items-center !bg-white shadow-sm hover:border-orange-400 transition-colors relative overflow-hidden group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500"></div>
                  <div className="flex gap-4 items-center pl-3">
                    <div className="bg-orange-50 p-3 rounded-full text-orange-600">
                      <Ticket size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold !text-gray-900">
                        {voucher.rewardId.name}
                      </h3>
                      <p className="text-xs !text-gray-500 mb-1">
                        Hết hạn:{' '}
                        {new Date(voucher.expiresAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="!bg-gray-100 px-2 py-1 rounded text-sm font-mono font-bold !text-orange-700 border border-gray-200">
                          {voucher.voucherCode}
                        </code>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(voucher.voucherCode)}
                    className="hover:bg-orange-50 hover:text-orange-600 border-gray-200"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="history"
          className="animate-in fade-in slide-in-from-bottom-2"
        >
          <Card className="!bg-white">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs !text-gray-500 uppercase !bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Thời gian</th>
                    <th className="px-6 py-4 font-medium">Hoạt động</th>
                    <th className="px-6 py-4 font-medium text-right">Điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((item) => (
                    <tr
                      key={item._id}
                      className="!bg-white hover:!bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap !text-gray-500">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium !text-gray-900 capitalize">
                          {item.type === 'earn'
                            ? 'Tích điểm mua hàng'
                            : item.type === 'redeem'
                            ? 'Đổi quà'
                            : item.type === 'refund'
                            ? 'Hoàn trả đơn hàng'
                            : item.type}
                        </p>
                        <p className="text-xs !text-gray-500 mt-0.5">
                          {item.description}
                        </p>
                      </td>
                      <td
                        className={`px-6 py-4 font-bold text-right ${
                          item.points > 0 ? '!text-green-600' : '!text-red-600'
                        }`}
                      >
                        {item.points > 0 ? '+' : ''}
                        {item.points}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-12 text-center !text-gray-500"
                      >
                        Chưa có lịch sử điểm nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG ĐÃ SỬA LỖI QUOTE */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="rounded-2xl !bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl !text-orange-600">
              🎁 Xác nhận đổi quà
            </AlertDialogTitle>
            <AlertDialogDescription className="!text-gray-600">
              {/* ✅ SỬA LỖI Ở ĐÂY: Dùng &quot; thay cho " */}
              Bạn có chắc chắn muốn dùng{' '}
              <span className="font-bold !text-gray-900">
                {selectedReward?.pointsRequired} điểm
              </span>{' '}
              để đổi lấy phần quà{' '}
              <span className="font-bold !text-gray-900">
                &quot;{selectedReward?.name}&quot;
              </span>{' '}
              không?
              <br />
              <br />
              <span className="text-xs !text-gray-400 italic">
                Voucher sẽ được lưu vào mục &quot;Voucher của tôi&quot; sau khi
                đổi thành công.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-gray-200 !bg-white !text-gray-700 hover:!bg-gray-50">
              Suy nghĩ lại
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRedeem}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 !text-white font-bold"
            >
              Đồng ý đổi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/src/lib/api'
import GlassCard from '@/src/components/admin/GlassCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  ArrowLeft,
  Crown,
  Mail,
  Phone,
  MapPin,
  Package,
  Star,
  Ban,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'
import AddressDialog from '@/src/components/admin/AddressDialog'

const statusLabel: Record<string, string> = {
  active: 'Đang hoạt động',
  blocked: 'Bị chặn',
  suspended: 'Tạm ngưng',
  deactivated: 'Ngưng kích hoạt'
}

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
  suspended: 'bg-yellow-100 text-yellow-700',
  deactivated: 'bg-gray-100 text-gray-700'
}

const tierColor: Record<string, string> = {
  platinum: 'from-purple-500 to-pink-500',
  gold: 'from-yellow-400 to-orange-500',
  silver: 'from-gray-300 to-gray-400',
  bronze: 'from-orange-300 to-amber-500'
}

const orderStatusLabel: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đã gửi hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
}

const orderStatusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

export default function CustomerDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [customer, setCustomer] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])

  const [tagInput, setTagInput] = useState('')
  const [showAddressDialog, setShowAddressDialog] = useState(false)

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/admin/customers/${id}`)
      setCustomer(data.customer)
      setAddresses(data.addresses || [])
      setOrders(data.orders || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const addTag = () => {
    if (!tagInput.trim()) return
    setCustomer({
      ...customer,
      tags: [...(customer.tags || []), tagInput.trim()]
    })
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setCustomer({
      ...customer,
      tags: (customer.tags || []).filter((t: string) => t !== tag)
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/admin/customers/${id}`, {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
        tags: customer.tags,
        status: customer.status,
        loyaltyPoints: customer.loyaltyPoints,
        loyaltyTier: customer.loyaltyTier
      })

      toast.success('Đã lưu thay đổi')
      await fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Không thể cập nhật')
    } finally {
      setSaving(false)
    }
  }

  const handleBlock = async () => {
    if (!confirm('Chặn khách hàng này?')) return
    setSaving(true)
    try {
      await api.put(`/admin/customers/${id}/status`, { status: 'blocked' })
      toast.success('Đã chặn khách hàng')
      await fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Không thể thay đổi')
    } finally {
      setSaving(false)
    }
  }

  const deleteAddress = async (addrId: string) => {
    if (!confirm('Xoá địa chỉ này?')) return
    try {
      await api.delete(`/admin/customers/${id}/addresses/${addrId}`)
      toast.success('Đã xoá địa chỉ')
      await fetchData()
    } catch (err: any) {
      toast.error('Không thể xoá địa chỉ')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-6">
        <p className="text-red-500">Không tìm thấy khách hàng</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-start gap-4">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
                tierColor[customer.loyaltyTier]
              } flex items-center justify-center text-white text-3xl font-bold shadow-lg`}
            >
              {customer.name?.charAt(0).toUpperCase() || '?'}
            </div>

            <div>
              <h1 className="text-3xl font-bold">{customer.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`bg-gradient-to-r ${
                    tierColor[customer.loyaltyTier]
                  } text-white`}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {customer.loyaltyTier.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  <Star className="w-3 h-3 mr-1" />
                  {customer.loyaltyPoints.toLocaleString()} điểm
                </Badge>
                <Badge className={statusColor[customer.status]}>
                  {statusLabel[customer.status]}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={saving || customer.status === 'blocked'}
            onClick={handleBlock}
          >
            <Ban className="w-4 h-4 mr-2" />
            Chặn
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="bg-gradient-to-br from-blue-50/60 to-cyan-50/60 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">
              Tổng đơn hàng
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {customer.ordersCount}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-green-50/60 to-emerald-50/60 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">
              Tổng chi tiêu
            </div>
            <div className="text-2xl font-bold text-green-600">
              {(customer.totalSpent / 1000000).toFixed(1)}M
            </div>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-purple-50/60 to-pink-50/60 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">
              Giá trị TB/đơn
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {(customer.averageOrderValue / 1000).toFixed(0)}K
            </div>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-orange-50/60 to-amber-50/60 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">
              Đơn gần nhất
            </div>
            <div className="text-sm font-medium text-orange-600">
              {customer.lastOrderDate
                ? new Date(customer.lastOrderDate).toLocaleDateString('vi-VN')
                : 'Chưa có'}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* INFO */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Thông tin khách hàng
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Họ tên
              </label>
              <Input
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <Input
                value={customer.email}
                onChange={(e) =>
                  setCustomer({ ...customer, email: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Số điện thoại
              </label>
              <Input
                value={customer.phone || ''}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Trạng thái
              </label>
              <Select
                value={customer.status}
                onValueChange={(v) => setCustomer({ ...customer, status: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="blocked">Bị chặn</SelectItem>
                  <SelectItem value="suspended">Tạm ngưng</SelectItem>
                  <SelectItem value="deactivated">Ngưng kích hoạt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Loyalty Tier
              </label>
              <Select
                value={customer.loyaltyTier}
                onValueChange={(v) =>
                  setCustomer({ ...customer, loyaltyTier: v })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Loyalty Points
              </label>
              <Input
                type="number"
                value={customer.loyaltyPoints}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    loyaltyPoints: Number(e.target.value)
                  })
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Ghi chú nội bộ
            </label>
            <Textarea
              value={customer.notes || ''}
              onChange={(e) =>
                setCustomer({ ...customer, notes: e.target.value })
              }
              className="mt-1"
              rows={3}
            />
          </div>

          {/* TAGS */}
          <div>
            <label className="text-sm font-medium text-gray-600">Tags</label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Nhập tag rồi Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addTag())
                }
              />
              <Button variant="outline" onClick={addTag}>
                Thêm
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              {customer.tags?.map((t: string) => (
                <Badge
                  key={t}
                  className="cursor-pointer hover:bg-red-100 bg-purple-100 text-purple-700"
                  onClick={() => removeTag(t)}
                >
                  {t} ✕
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ADDRESSES */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Địa chỉ
          </h2>
          <Button onClick={() => setShowAddressDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm địa chỉ
          </Button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-gray-500 text-center py-6">Chưa có địa chỉ nào</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((a) => (
              <div
                key={a._id}
                className="border border-white/20 rounded-xl p-4 bg-white/10 hover:bg-white/20 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      {a.fullName}
                      {a.isDefault && (
                        <Badge className="bg-green-500">Mặc định</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <Phone className="w-3 h-3 inline mr-1" />
                      {a.phone}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      {a.addressLine1}
                      {a.addressLine2 && `, ${a.addressLine2}`}
                      {a.ward && `, ${a.ward}`}
                      {a.district && `, ${a.district}`}
                      {a.province && `, ${a.province}`}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteAddress(a._id)}
                  >
                    Xoá
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ORDER HISTORY */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Lịch sử mua hàng
          </h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  Chưa có đơn hàng
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o._id} className="hover:bg-white/30 transition">
                  <TableCell className="font-medium">
                    #{o.orderNumber || o._id.slice(-6)}
                  </TableCell>
                  <TableCell>
                    {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {o.totalPrice.toLocaleString()}₫
                  </TableCell>
                  <TableCell>
                    <Badge className={orderStatusColor[o.status]}>
                      {orderStatusLabel[o.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/orders/${o._id}`)}
                    >
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </GlassCard>

      {/* Address Dialog */}
      <AddressDialog
        open={showAddressDialog}
        onClose={() => setShowAddressDialog(false)}
        customerId={id}
        onSuccess={() => {
          setShowAddressDialog(false)
          fetchData()
        }}
      />
    </div>
  )
}

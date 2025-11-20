'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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

import { toast } from 'sonner'

const statusLabel: Record<string, string> = {
  active: 'Đang hoạt động',
  blocked: 'Bị chặn',
  suspended: 'Tạm ngưng',
  deactivated: 'Ngừng kích hoạt'
}

const emptyAddress = {
  _id: 'new',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  ward: '',
  district: '',
  province: '',
  isDefault: false
}

export default function CustomerDetailPage() {
  const { id } = useParams() as { id: string }

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [customer, setCustomer] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])

  const [tagInput, setTagInput] = useState('')
  const [editingAddress, setEditingAddress] = useState<any | null>(null)
  const [isCreatingAddress, setIsCreatingAddress] = useState(false)
  const [addressSaving, setAddressSaving] = useState(false)

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/admin/customers/${id}`)
      const c = data.customer

      setCustomer({
        ...c,
        status: c.status || 'active',
        tags: c.tags || []
      })

      setAddresses(data.addresses || [])
      setOrders([]) // placeholder
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  // TAG HELPERS
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

  // SAVE
  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/admin/customers/${id}`, {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
        tags: customer.tags,
        status: customer.status
      })

      toast.success('Đã lưu thay đổi')
      await fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Không thể cập nhật')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    setSaving(true)
    try {
      await api.put(`/admin/customers/${id}/status`, { status: 'deactivated' })
      toast.success('Khách hàng đã được ngừng kích hoạt')
      await fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Không thể thay đổi')
    } finally {
      setSaving(false)
    }
  }

  // ADDRESS HELPERS
  const startCreateAddress = () => {
    setEditingAddress({ ...emptyAddress })
    setIsCreatingAddress(true)
  }

  const startEditAddress = (addr: any) => {
    setEditingAddress({ ...addr })
    setIsCreatingAddress(false)
  }

  const cancelEditAddress = () => {
    setEditingAddress(null)
    setIsCreatingAddress(false)
  }

  const updateEditingAddress = (field: string, value: any) => {
    setEditingAddress((prev: any) => ({ ...prev, [field]: value }))
  }

  const saveAddress = async () => {
    if (!editingAddress) return

    if (
      !editingAddress.fullName ||
      !editingAddress.phone ||
      !editingAddress.addressLine1
    ) {
      toast.error('Vui lòng nhập đầy đủ họ tên, SĐT và địa chỉ dòng 1')
      return
    }

    setAddressSaving(true)
    try {
      if (isCreatingAddress || editingAddress._id === 'new') {
        await api.post(`/admin/customers/${id}/addresses`, editingAddress)
        toast.success('Đã thêm địa chỉ mới')
      } else {
        await api.put(
          `/admin/customers/${id}/addresses/${editingAddress._id}`,
          editingAddress
        )
        toast.success('Đã cập nhật địa chỉ')
      }

      await fetchData()
      cancelEditAddress()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Không thể lưu địa chỉ')
    } finally {
      setAddressSaving(false)
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

  if (loading) return <div className="p-6">Đang tải...</div>
  if (!customer) return <div className="p-6">Không tìm thấy khách hàng</div>

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Khách hàng: {customer.name}
          </h1>
          <div className="mt-1 text-sm text-gray-500">
            Trạng thái: <Badge>{statusLabel[customer.status]}</Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={saving || customer.status === 'deactivated'}
            onClick={handleDeactivate}
          >
            Ngừng kích hoạt
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      {/* INFO */}
      <GlassCard className="p-6 space-y-4">
        <h2 className="text-xl font-medium mb-2">Thông tin khách hàng</h2>

        <Input
          placeholder="Tên"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />

        <Input
          placeholder="Email"
          value={customer.email}
          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
        />

        <Input
          placeholder="Số điện thoại"
          value={customer.phone || ''}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />

        <div className="space-y-1">
          <div className="text-sm font-medium">Trạng thái</div>
          <Select
            value={customer.status}
            onValueChange={(v) => setCustomer({ ...customer, status: v })}
          >
            <SelectTrigger className="w-60">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="blocked">Bị chặn</SelectItem>
              <SelectItem value="suspended">Tạm ngưng</SelectItem>
              <SelectItem value="deactivated">Ngừng kích hoạt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Textarea
          placeholder="Ghi chú nội bộ"
          value={customer.notes || ''}
          onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
        />

        {/* TAGS */}
        <div className="space-y-2">
          <div className="font-medium">Tags</div>

          <div className="flex gap-2">
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

          <div className="flex gap-2 flex-wrap">
            {customer.tags?.map((t: string) => (
              <Badge
                key={t}
                className="cursor-pointer bg-purple-200 text-purple-700"
                onClick={() => removeTag(t)}
              >
                {t} ✕
              </Badge>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* ADDRESS */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Địa chỉ</h2>

          {!editingAddress && (
            <Button onClick={startCreateAddress}>Thêm địa chỉ</Button>
          )}
        </div>

        {/* EDIT FORM */}
        {editingAddress && (
          <div className="border border-white/30 rounded-xl p-4 space-y-4 bg-white/20 backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Họ tên"
                value={editingAddress.fullName}
                onChange={(e) =>
                  updateEditingAddress('fullName', e.target.value)
                }
              />
              <Input
                placeholder="Số điện thoại"
                value={editingAddress.phone}
                onChange={(e) => updateEditingAddress('phone', e.target.value)}
              />
            </div>

            <Input
              placeholder="Địa chỉ dòng 1"
              value={editingAddress.addressLine1}
              onChange={(e) =>
                updateEditingAddress('addressLine1', e.target.value)
              }
            />

            <Input
              placeholder="Địa chỉ dòng 2 (tuỳ chọn)"
              value={editingAddress.addressLine2}
              onChange={(e) =>
                updateEditingAddress('addressLine2', e.target.value)
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Phường/Xã"
                value={editingAddress.ward}
                onChange={(e) => updateEditingAddress('ward', e.target.value)}
              />
              <Input
                placeholder="Quận/Huyện"
                value={editingAddress.district}
                onChange={(e) =>
                  updateEditingAddress('district', e.target.value)
                }
              />
              <Input
                placeholder="Tỉnh/Thành phố"
                value={editingAddress.province}
                onChange={(e) =>
                  updateEditingAddress('province', e.target.value)
                }
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editingAddress.isDefault}
                onChange={(e) =>
                  updateEditingAddress('isDefault', e.target.checked)
                }
              />
              Đặt làm địa chỉ mặc định
            </label>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEditAddress}>
                Huỷ
              </Button>
              <Button onClick={saveAddress} disabled={addressSaving}>
                {addressSaving ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </Button>
            </div>
          </div>
        )}

        {/* ADDRESS LIST */}
        {addresses.length === 0 && !editingAddress && (
          <div className="text-sm text-gray-500">Chưa có địa chỉ nào</div>
        )}

        <div className="space-y-3">
          {addresses.map((a) => (
            <div
              key={a._id}
              className="border border-white/20 rounded-xl p-4 bg-white/10 backdrop-blur-sm flex flex-col md:flex-row justify-between"
            >
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {a.fullName}
                  {a.isDefault && (
                    <Badge className="bg-green-200 text-green-700">
                      Mặc định
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-gray-700">
                  {a.phone && <span>{a.phone} · </span>}
                  {a.addressLine1}
                  {a.addressLine2 && `, ${a.addressLine2}`}
                  {a.ward && `, ${a.ward}`}
                  {a.district && `, ${a.district}`}
                  {a.province && `, ${a.province}`}
                </div>
              </div>

              <div className="flex gap-2 mt-3 md:mt-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEditAddress(a)}
                >
                  Sửa
                </Button>
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
      </GlassCard>

      {/* ORDER HISTORY */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-medium mb-3">Lịch sử mua hàng</h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-6 text-center text-gray-500"
                >
                  Chưa có đơn hàng
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  )
}

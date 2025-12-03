'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import api from '@/src/lib/api'
import { toast } from 'sonner'

interface AddressDialogProps {
  open: boolean
  onClose: () => void
  customerId: string
  onSuccess: () => void
}

export default function AddressDialog({
  open,
  onClose,
  customerId,
  onSuccess
}: AddressDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    ward: '',
    district: '',
    province: '',
    isDefault: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post(`/admin/customers/${customerId}/addresses`, formData)
      toast.success('Đã thêm địa chỉ mới')
      setFormData({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        ward: '',
        district: '',
        province: '',
        isDefault: false
      })
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Không thể thêm địa chỉ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm địa chỉ mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Họ tên người nhận *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="addressLine1">Địa chỉ chi tiết *</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              placeholder="Số nhà, tên đường..."
              value={formData.addressLine1}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="addressLine2">Địa chỉ bổ sung</Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              placeholder="Tòa nhà, tầng, căn hộ..."
              value={formData.addressLine2}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ward">Phường/Xã</Label>
              <Input
                id="ward"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="district">Quận/Huyện</Label>
              <Input
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="province">Tỉnh/Thành phố</Label>
              <Input
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isDefault: checked as boolean })
              }
            />
            <Label
              htmlFor="isDefault"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Đặt làm địa chỉ mặc định
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

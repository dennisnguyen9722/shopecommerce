'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import api from '@/src/lib/api'
import { toast } from 'sonner'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

export default function AddressDialog({
  open,
  onClose,
  customerId,
  onSuccess
}: {
  open: boolean
  onClose: () => void
  customerId: string
  onSuccess: () => void
}) {
  const [saving, setSaving] = useState(false)

  // API data
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])

  // Form fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [addressLine2, setAddressLine2] = useState('')

  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [ward, setWard] = useState('')

  const [preview, setPreview] = useState('')

  // Load provinces
  useEffect(() => {
    if (open) {
      fetch('https://provinces.open-api.vn/api/?depth=1')
        .then((res) => res.json())
        .then((data) => setProvinces(data))
    }
  }, [open])

  // Load districts
  useEffect(() => {
    if (!province) return
    fetch(`https://provinces.open-api.vn/api/p/${province}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        setDistricts(data.districts)
        setDistrict('')
        setWard('')
        setWards([])
      })
  }, [province])

  // Load wards
  useEffect(() => {
    if (!district) return
    fetch(`https://provinces.open-api.vn/api/d/${district}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        setWards(data.wards)
        setWard('')
      })
  }, [district])

  // Update preview
  useEffect(() => {
    const p = provinces.find((x) => x.code == province)?.name || ''
    const d = districts.find((x) => x.code == district)?.name || ''
    const w = wards.find((x) => x.code == ward)?.name || ''

    let full = ''

    if (houseNumber) full += houseNumber
    if (w) full += (full ? ', ' : '') + w
    if (d) full += (full ? ', ' : '') + d
    if (p) full += (full ? ', ' : '') + p

    setPreview(full)
  }, [houseNumber, province, district, ward])

  const handleSubmit = async () => {
    if (!fullName.trim() || !phone.trim() || !province || !district || !ward) {
      toast.error('Vui lòng nhập đủ thông tin bắt buộc')
      return
    }

    setSaving(true)
    try {
      await api.post(`/admin/customers/${customerId}/addresses`, {
        fullName,
        phone,
        addressLine1: preview,
        addressLine2,
        ward,
        district,
        province,
        isDefault: true
      })

      toast.success('Thêm địa chỉ thành công!')

      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Không thể lưu địa chỉ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Thêm địa chỉ mới</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Input
            placeholder="Họ tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* House number */}
          <Input
            placeholder="Số nhà, tên đường"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
          />

          <Input
            placeholder="Địa chỉ bổ sung (không bắt buộc)"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />

          {/* Two columns: province + district */}
          <div className="grid grid-cols-2 gap-3">
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Tỉnh/Thành phố" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((p) => (
                  <SelectItem value={String(p.code)} key={p.code}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={district}
              onValueChange={setDistrict}
              disabled={!province}
            >
              <SelectTrigger>
                <SelectValue placeholder="Quận/Huyện" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem value={String(d.code)} key={d.code}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ward */}
          <Select value={ward} onValueChange={setWard} disabled={!district}>
            <SelectTrigger>
              <SelectValue placeholder="Phường/Xã" />
            </SelectTrigger>
            <SelectContent>
              {wards.map((w) => (
                <SelectItem value={String(w.code)} key={w.code}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Preview */}
          <Input value={preview} readOnly className="font-medium" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>

          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu địa chỉ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

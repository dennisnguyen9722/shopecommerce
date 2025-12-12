/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/src/store/authStore'
import serverApi from '@/src/lib/api'
import { toast } from 'sonner'
import { MapPin, Plus, CheckCircle2, Circle, Mail } from 'lucide-react' // Thêm icon Mail
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Type cho Address từ API
type Address = {
  _id: string
  fullName: string
  phone: string
  addressLine1: string
  province: string
  district: string
  ward: string
  isDefault: boolean
}

// Type cho Location API
type LocationOption = {
  id: string
  name: string
  full_name: string
}

export default function Step1Shipping({ next }: { next: (data: any) => void }) {
  const { isAuthenticated, user } = useAuthStore()

  const [useSavedAddress, setUseSavedAddress] = useState(isAuthenticated)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  )
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)

  // State form nhập mới
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '', // 👇 THÊM EMAIL VÀO STATE
    phone: user?.phone || '',
    addressLine1: '',
    province: '',
    district: '',
    ward: ''
  })

  // State Location Data
  const [provinces, setProvinces] = useState<LocationOption[]>([])
  const [districts, setDistricts] = useState<LocationOption[]>([])
  const [wards, setWards] = useState<LocationOption[]>([])

  const [provId, setProvId] = useState('')
  const [distId, setDistId] = useState('')

  // 1. Load Saved Addresses
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingAddresses(true)
      serverApi
        .get('/public/profile/addresses')
        .then((res) => {
          setSavedAddresses(res.data)
          const defaultAddr =
            res.data.find((a: Address) => a.isDefault) || res.data[0]
          if (defaultAddr) setSelectedAddressId(defaultAddr._id)
          else setUseSavedAddress(false)
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoadingAddresses(false))
    } else {
      setUseSavedAddress(false)
    }
  }, [isAuthenticated])

  // 2. Load Tỉnh/Thành
  useEffect(() => {
    fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0) setProvinces(data.data)
      })
      .catch((err) => console.error(err))
  }, [])

  // Logic Cascading Dropdown
  const handleProvChange = (id: string) => {
    const prov = provinces.find((p) => p.id === id)
    if (!prov) return
    setProvId(id)
    setForm((prev) => ({
      ...prev,
      province: prov.full_name,
      district: '',
      ward: ''
    }))
    setDistricts([])
    setWards([])
    fetch(`https://esgoo.net/api-tinhthanh/2/${id}.htm`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0) setDistricts(data.data)
      })
  }

  const handleDistChange = (id: string) => {
    const dist = districts.find((d) => d.id === id)
    if (!dist) return
    setDistId(id)
    setForm((prev) => ({ ...prev, district: dist.full_name, ward: '' }))
    setWards([])
    fetch(`https://esgoo.net/api-tinhthanh/3/${id}.htm`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0) setWards(data.data)
      })
  }

  const handleWardChange = (id: string) => {
    const ward = wards.find((w) => w.id === id)
    if (ward) setForm((prev) => ({ ...prev, ward: ward.full_name }))
  }

  // Xử lý Submit
  const handleSubmit = () => {
    let finalData

    if (useSavedAddress && selectedAddressId) {
      // Case 1: Dùng địa chỉ có sẵn
      const selected = savedAddresses.find((a) => a._id === selectedAddressId)
      if (!selected) return toast.error('Vui lòng chọn địa chỉ')

      // 👇 MAP ĐÚNG KEY CHO STEP 3 (name, email, phone, address)
      finalData = {
        name: selected.fullName,
        email: user?.email || '', // Lấy email từ account nếu dùng địa chỉ lưu
        phone: selected.phone,
        address: `${selected.addressLine1}, ${selected.ward}, ${selected.district}, ${selected.province}`
      }
    } else {
      // Case 2: Dùng form nhập mới
      if (
        !form.fullName ||
        !form.email ||
        !form.phone ||
        !form.addressLine1 ||
        !form.province ||
        !form.district ||
        !form.ward
      ) {
        return toast.error('Vui lòng điền đầy đủ thông tin giao hàng')
      }

      // 👇 MAP ĐÚNG KEY CHO STEP 3
      finalData = {
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        address: `${form.addressLine1}, ${form.ward}, ${form.district}, ${form.province}`
      }
    }

    // Gửi data sang bước 2 (và sau đó là bước 3)
    next(finalData)
  }

  return (
    <div className="space-y-6">
      {/* --- PHẦN 1: LIST ĐỊA CHỈ --- */}
      {isAuthenticated && savedAddresses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Sổ địa chỉ của bạn</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseSavedAddress(!useSavedAddress)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              {useSavedAddress ? (
                <Plus size={16} className="mr-1" />
              ) : (
                <MapPin size={16} className="mr-1" />
              )}
              {useSavedAddress ? 'Giao đến địa chỉ khác' : 'Chọn từ sổ địa chỉ'}
            </Button>
          </div>

          {useSavedAddress && (
            <div className="grid gap-3">
              {savedAddresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddressId(addr._id)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAddressId === addr._id
                      ? 'border-orange-500 bg-orange-50/50'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 ${
                        selectedAddressId === addr._id
                          ? 'text-orange-600'
                          : 'text-gray-300'
                      }`}
                    >
                      {selectedAddressId === addr._id ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">
                        {addr.fullName}{' '}
                        <span className="font-normal text-gray-500 text-sm">
                          | {addr.phone}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {addr.addressLine1}, {addr.ward}, {addr.district},{' '}
                        {addr.province}
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-2 inline-block">
                          Mặc định
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- PHẦN 2: FORM NHẬP MỚI --- */}
      {(!useSavedAddress || savedAddresses.length === 0) && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-orange-600" size={20} />
            <h3 className="font-bold text-gray-900 text-lg">
              Thông tin giao hàng
            </h3>
          </div>

          {/* Hàng 1: Tên & SĐT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input
                placeholder="Nguyễn Văn A"
                className="bg-white"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                placeholder="090..."
                className="bg-white"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          {/* 👇 Hàng 2: Email (QUAN TRỌNG: ĐÃ THÊM MỚI) */}
          <div className="space-y-2">
            <Label>Địa chỉ Email (để nhận thông báo đơn hàng)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="email"
                placeholder="example@gmail.com"
                className="bg-white pl-9"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* Hàng 3: Chọn địa điểm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tỉnh / Thành</Label>
              <Select onValueChange={handleProvChange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Chọn Tỉnh" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {provinces.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quận / Huyện</Label>
              <Select onValueChange={handleDistChange} disabled={!provId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Chọn Quận" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phường / Xã</Label>
              <Select onValueChange={handleWardChange} disabled={!distId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Chọn Phường" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {wards.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Địa chỉ cụ thể</Label>
            <Input
              placeholder="Số nhà, tên đường, tòa nhà..."
              className="bg-white"
              value={form.addressLine1}
              onChange={(e) =>
                setForm({ ...form, addressLine1: e.target.value })
              }
            />
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-orange-200 transition-all"
        >
          Tiếp tục thanh toán
        </Button>
      </div>
    </div>
  )
}

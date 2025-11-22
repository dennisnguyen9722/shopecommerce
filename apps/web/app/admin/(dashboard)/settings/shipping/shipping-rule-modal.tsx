'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { ShippingRule } from './page'

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  rule?: ShippingRule | null
}

function toNumber(v: any): number | '' {
  if (v === '' || v === null || v === undefined) return ''
  const n = Number(v)
  return isNaN(n) ? '' : n
}

type Province = { code: string; name: string }
type District = { code: string; name: string }

export default function ShippingRuleModal({
  open,
  onClose,
  onSaved,
  rule
}: Props) {
  const modalKey = `${rule?._id ?? 'new'}-${open}`

  /* STATES WITH TYPES */
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [districtCodes, setDistrictCodes] = useState<string[]>([])

  const [type, setType] = useState<ShippingRule['type']>('flat')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [threshold, setThreshold] = useState<number | ''>('')
  const [areas, setAreas] = useState('')

  const [minWeight, setMinWeight] = useState<number | ''>('')
  const [maxWeight, setMaxWeight] = useState<number | ''>('')

  const [provinceCode, setProvinceCode] = useState('')

  /* LOAD PROVINCES (1 lần) */
  useEffect(() => {
    api.get('/admin/locations/provinces').then((res) => {
      const p: Province[] = res.data || []
      setProvinces(p)
    })
  }, [])

  /* INITIALIZE FORM DATA - Chỉ chạy khi modal mở và rule thay đổi */
  useEffect(() => {
    if (!open) return

    const initializeForm = () => {
      if (!rule) {
        // NEW
        setType('flat')
        setName('')
        setAmount('')
        setThreshold('')
        setAreas('')
        setMinWeight('')
        setMaxWeight('')
        setProvinceCode('')
        setDistrictCodes([])
        setDistricts([])
        return
      }

      // EDIT MODE
      setType(rule.type)
      setName(rule.name ?? '')
      setAmount(toNumber(rule.amount))
      setThreshold(toNumber(rule.threshold))
      setAreas(rule.areas?.join(', ') ?? '')
      setMinWeight(toNumber(rule.minWeight))
      setMaxWeight(toNumber(rule.maxWeight))

      if (rule.type === 'district_based') {
        // Province và districts có thể là object hoặc string
        const province = rule.province as any
        const pcode =
          typeof province === 'string' ? province : province?.code || ''

        setProvinceCode(pcode)

        const districts = rule.districts as any
        const codes = (districts || []).map((d: any) =>
          typeof d === 'string' ? d : d.code
        )
        setDistrictCodes(codes)

        // Load districts for editing
        if (pcode) {
          api
            .get(`/admin/locations/provinces/${pcode}/districts`)
            .then((res) => {
              const list: District[] = res.data || []
              setDistricts(list)
            })
        }
      } else {
        setProvinceCode('')
        setDistrictCodes([])
        setDistricts([])
      }
    }

    // Wrap in requestAnimationFrame to avoid synchronous updates
    requestAnimationFrame(() => {
      initializeForm()
    })
  }, [open, rule?._id])

  /* LOAD DISTRICTS WHEN PROVINCE CHANGES (but not on initial load) */
  useEffect(() => {
    if (!open) return

    // Skip if this is initial load from edit mode
    if (rule?.type === 'district_based' && !districts.length) return

    if (!provinceCode) {
      requestAnimationFrame(() => {
        setDistricts([])
        setDistrictCodes([])
      })
      return
    }

    api
      .get(`/admin/locations/provinces/${provinceCode}/districts`)
      .then((res) => {
        const list: District[] = res.data || []
        setDistricts(list)

        // keep valid selections
        setDistrictCodes((prev) =>
          prev.filter((c) => list.some((d) => d.code === c))
        )
      })
  }, [provinceCode, open])

  /* SAVE */
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        type,
        name: name || 'Shipping Rule',
        isActive: rule?.isActive ?? true
      }

      if (type === 'flat') payload.amount = amount
      if (type === 'free_over') payload.threshold = threshold

      if (type === 'location_based') {
        payload.amount = amount
        payload.areas = areas
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
      }

      if (type === 'weight_based') {
        payload.amount = amount
        payload.minWeight = minWeight
        payload.maxWeight = maxWeight
      }

      if (type === 'district_based') {
        const province = provinces.find((p) => p.code === provinceCode)

        payload.amount = amount
        // Gửi object { code, name }
        payload.province = province
          ? { code: province.code, name: province.name }
          : null

        payload.districts = districtCodes
          .map((code) => {
            const district = districts.find((d) => d.code === code)
            return district
              ? { code: district.code, name: district.name }
              : null
          })
          .filter(Boolean)
      }

      if (rule?._id) {
        return (await api.put(`/admin/shipping-rules/${rule._id}`, payload))
          .data
      }
      return (await api.post('/admin/shipping-rules', payload)).data
    },
    onSuccess: () => {
      toast.success('Lưu thành công')
      onSaved()
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Lỗi lưu!')
    }
  })

  /* UI */
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent key={modalKey}>
        <DialogHeader>
          <DialogTitle>{rule ? 'Chỉnh sửa' : 'Thêm rule mới'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* TYPE */}
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Loại rule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flat">Phí cố định</SelectItem>
              <SelectItem value="free_over">Miễn phí theo đơn</SelectItem>
              <SelectItem value="location_based">Theo tỉnh/thành</SelectItem>
              <SelectItem value="weight_based">Theo cân nặng</SelectItem>
              <SelectItem value="district_based">Theo Quận/Huyện</SelectItem>
            </SelectContent>
          </Select>

          {/* NAME */}
          <Input
            placeholder="Tên rule"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* FLAT */}
          {type === 'flat' && (
            <Input
              type="number"
              placeholder="Phí ship"
              value={amount}
              onChange={(e) => setAmount(toNumber(e.target.value))}
            />
          )}

          {/* FREE OVER */}
          {type === 'free_over' && (
            <Input
              type="number"
              placeholder="Free ship cho đơn > ..."
              value={threshold}
              onChange={(e) => setThreshold(toNumber(e.target.value))}
            />
          )}

          {/* LOCATION BASED */}
          {type === 'location_based' && (
            <>
              <Input
                placeholder="Tỉnh/thành (phân cách bởi dấu phẩy)"
                value={areas}
                onChange={(e) => setAreas(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Phí ship"
                value={amount}
                onChange={(e) => setAmount(toNumber(e.target.value))}
              />
            </>
          )}

          {/* WEIGHT BASED */}
          {type === 'weight_based' && (
            <>
              <Input
                type="number"
                placeholder="Cân nặng từ (gram)"
                value={minWeight}
                onChange={(e) => setMinWeight(toNumber(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Đến (gram)"
                value={maxWeight}
                onChange={(e) => setMaxWeight(toNumber(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Phí ship"
                value={amount}
                onChange={(e) => setAmount(toNumber(e.target.value))}
              />
            </>
          )}

          {/* DISTRICT BASED */}
          {type === 'district_based' && (
            <>
              {/* Province */}
              <Select
                value={provinceCode}
                onValueChange={(val) => setProvinceCode(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn Tỉnh/Thành" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Districts */}
              <div className="text-sm mt-2">Chọn Quận/Huyện</div>
              <div className="border rounded max-h-48 overflow-auto p-2">
                {districts.map((d) => (
                  <label key={d.code} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={districtCodes.includes(d.code)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setDistrictCodes((prev) => [...prev, d.code])
                        else
                          setDistrictCodes((prev) =>
                            prev.filter((c) => c !== d.code)
                          )
                      }}
                    />
                    <span>{d.name}</span>
                  </label>
                ))}
              </div>

              <Input
                type="number"
                placeholder="Phí ship"
                value={amount}
                onChange={(e) => setAmount(toNumber(e.target.value))}
              />
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => saveMutation.mutate()}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

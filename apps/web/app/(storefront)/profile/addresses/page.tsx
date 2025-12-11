'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import serverApi from '@/src/lib/api'
import { toast } from 'sonner'
import { Plus, MapPin, Trash2, Edit2, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Type cho Open API
type Division = {
  code: number
  name: string
  districts?: Division[]
  wards?: Division[]
}

export default function AddressPage() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Data hành chính (Load full tree 1 lần cho mượt)
  const [treeData, setTreeData] = useState<Division[]>([])
  const [isLoadingTree, setIsLoadingTree] = useState(true)

  // State form
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    provinceCode: 0,
    districtCode: 0,
    wardCode: 0,
    provinceName: '',
    districtName: '',
    wardName: '',
    isDefault: false
  })

  // 1. Fetch Addresses từ DB
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: async () => {
      const res = await serverApi.get('/public/profile/addresses')
      return res.data
    }
  })

  // 2. Fetch Administrative Tree (Chạy 1 lần)
  useEffect(() => {
    const fetchTree = async () => {
      try {
        // Gọi API backend của bạn
        const res = await serverApi.get('/public/provinces?depth=3')
        setTreeData(res.data)
      } catch (error) {
        console.error('Lỗi lấy data hành chính:', error)
        toast.error('Không thể tải dữ liệu địa chỉ. Vui lòng tải lại trang.')
      } finally {
        setIsLoadingTree(false)
      }
    }
    fetchTree()
  }, [])

  // Computed Options (Tự động lọc theo code đã chọn)
  const provinceOptions = treeData
  const districtOptions = useMemo(() => {
    return (
      treeData.find((p) => p.code === formData.provinceCode)?.districts || []
    )
  }, [treeData, formData.provinceCode])

  const wardOptions = useMemo(() => {
    return (
      districtOptions.find((d) => d.code === formData.districtCode)?.wards || []
    )
  }, [districtOptions, formData.districtCode])

  // Handlers Select
  const handleProvinceChange = (value: string) => {
    const code = Number(value)
    const name = treeData.find((p) => p.code === code)?.name || ''
    setFormData((prev) => ({
      ...prev,
      provinceCode: code,
      provinceName: name,
      districtCode: 0,
      districtName: '', // Reset cấp con
      wardCode: 0,
      wardName: ''
    }))
  }

  const handleDistrictChange = (value: string) => {
    const code = Number(value)
    const name = districtOptions.find((d) => d.code === code)?.name || ''
    setFormData((prev) => ({
      ...prev,
      districtCode: code,
      districtName: name,
      wardCode: 0,
      wardName: '' // Reset cấp con
    }))
  }

  const handleWardChange = (value: string) => {
    const code = Number(value)
    const name = wardOptions.find((w) => w.code === code)?.name || ''
    setFormData((prev) => ({ ...prev, wardCode: code, wardName: name }))
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) =>
      serverApi.post('/public/profile/addresses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] })
      toast.success('Thêm địa chỉ thành công')
      setIsOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) =>
      serverApi.put(`/public/profile/addresses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] })
      toast.success('Cập nhật thành công')
      setIsOpen(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      serverApi.delete(`/public/profile/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] })
      toast.success('Đã xóa địa chỉ')
    }
  })

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) =>
      serverApi.patch(`/public/profile/addresses/${id}/set-default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] })
      toast.success('Đã đặt làm mặc định')
    }
  })

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({
      fullName: '',
      phone: '',
      addressLine1: '',
      provinceCode: 0,
      provinceName: '',
      districtCode: 0,
      districtName: '',
      wardCode: 0,
      wardName: '',
      isDefault: false
    })
    setIsOpen(true)
  }

  const handleOpenEdit = (addr: any) => {
    setEditingId(addr._id)
    // Lưu ý: Nếu DB của bạn chỉ lưu Text (Tên tỉnh), việc map ngược lại Code sẽ khó chính xác 100%.
    // Tốt nhất nên lưu cả Code và Name xuống DB (đã update ở Model).
    // Ở đây mình giả định bạn lưu Tên, user sẽ phải chọn lại nếu muốn sửa địa danh.
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      provinceCode: 0,
      provinceName: addr.province || '', // Giữ tên cũ để hiển thị
      districtCode: 0,
      districtName: addr.district || '',
      wardCode: 0,
      wardName: addr.ward || '',
      isDefault: addr.isDefault
    })
    setIsOpen(true)
  }

  const handleSubmit = () => {
    // Validate
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.addressLine1 ||
      !formData.provinceName ||
      !formData.districtName ||
      !formData.wardName
    ) {
      return toast.error('Vui lòng nhập đầy đủ thông tin')
    }

    const payload = {
      fullName: formData.fullName,
      phone: formData.phone,
      addressLine1: formData.addressLine1,
      province: formData.provinceName, // Lưu tên xuống DB
      district: formData.districtName,
      ward: formData.wardName,
      isDefault: formData.isDefault
    }

    if (editingId) updateMutation.mutate({ id: editingId, data: payload })
    else createMutation.mutate(payload)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sổ địa chỉ</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý địa chỉ nhận hàng của bạn
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ mới
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-orange-500" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Bạn chưa lưu địa chỉ nào.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((addr: any) => (
            <div
              key={addr._id}
              className="group relative border border-gray-200 rounded-xl p-5 hover:border-orange-200 hover:bg-orange-50/30 transition-all bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-lg">
                      {addr.fullName}
                    </span>
                    {addr.isDefault && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100 shadow-none">
                        <Check size={12} className="mr-1" /> Mặc định
                      </Badge>
                    )}
                  </div>
                  <div className="text-gray-600 text-sm flex items-center gap-2">
                    <span className="text-gray-400">|</span> {addr.phone}
                  </div>
                  <div className="text-gray-700 mt-2 text-sm max-w-lg leading-relaxed">
                    {addr.addressLine1}
                    <br />
                    {addr.ward}, {addr.district}, {addr.province}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(addr)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Sửa
                    </Button>
                    {!addr.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(addr._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Xóa
                      </Button>
                    )}
                  </div>
                  {!addr.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultMutation.mutate(addr._id)}
                      disabled={setDefaultMutation.isPending}
                      className="text-xs h-8 bg-white border-gray-200 text-gray-600 hover:text-orange-600 hover:border-orange-200"
                    >
                      Đặt làm mặc định
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DIALOG FORM */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white text-gray-900 sm:max-w-[700px] p-6 gap-0">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold">
              {editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Hàng 1: Tên + SĐT */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Họ và tên</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="bg-white border-gray-300 h-11"
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Số điện thoại
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="bg-white border-gray-300 h-11"
                  placeholder="Ví dụ: 0909 123 456"
                />
              </div>
            </div>

            {/* Hàng 2: Select 3 Cấp - FIX GAP RỘNG HƠN */}
            <div className="grid grid-cols-3 gap-6">
              {/* Tỉnh/Thành */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Tỉnh/Thành</Label>
                <Select
                  value={
                    formData.provinceCode
                      ? String(formData.provinceCode)
                      : undefined
                  }
                  onValueChange={handleProvinceChange}
                  disabled={isLoadingTree}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-11 focus:ring-orange-500">
                    <SelectValue
                      placeholder={
                        isLoadingTree
                          ? 'Đang tải...'
                          : formData.provinceName || 'Chọn Tỉnh'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] z-[99999]">
                    {provinceOptions.map((p) => (
                      <SelectItem key={p.code} value={String(p.code)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quận/Huyện */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Quận/Huyện</Label>
                <Select
                  value={
                    formData.districtCode
                      ? String(formData.districtCode)
                      : undefined
                  }
                  onValueChange={handleDistrictChange}
                  disabled={!formData.provinceCode}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-11 focus:ring-orange-500">
                    <SelectValue
                      placeholder={formData.districtName || 'Chọn Quận'}
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] z-[99999]">
                    {districtOptions.map((d) => (
                      <SelectItem key={d.code} value={String(d.code)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phường/Xã */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Phường/Xã</Label>
                <Select
                  value={
                    formData.wardCode ? String(formData.wardCode) : undefined
                  }
                  onValueChange={handleWardChange}
                  disabled={!formData.districtCode}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-11 focus:ring-orange-500">
                    <SelectValue
                      placeholder={formData.wardName || 'Chọn Phường'}
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] z-[99999]">
                    {wardOptions.map((w) => (
                      <SelectItem key={w.code} value={String(w.code)}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hàng 3: Địa chỉ cụ thể */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">
                Địa chỉ cụ thể
              </Label>
              <Input
                value={formData.addressLine1}
                onChange={(e) =>
                  setFormData({ ...formData, addressLine1: e.target.value })
                }
                className="bg-white border-gray-300 h-11"
                placeholder="Số nhà, tên đường, tòa nhà..."
              />
            </div>

            {/* Hàng 4: Mặc định */}
            <div className="flex items-center gap-3 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
                className="w-5 h-5 accent-orange-600 cursor-pointer rounded"
              />
              <Label
                htmlFor="isDefault"
                className="cursor-pointer text-gray-900 font-medium select-none"
              >
                Đặt làm địa chỉ nhận hàng mặc định
              </Label>
            </div>
          </div>

          <DialogFooter className="mt-8 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-gray-300 text-gray-700 h-11 px-6 font-medium"
            >
              Trở lại
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-orange-600 text-white hover:bg-orange-700 h-11 px-8 shadow-md font-medium"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : (
                'Hoàn thành'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

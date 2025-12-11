/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useRef } from 'react'
import { useAuthStore } from '@/src/store/authStore'
import {
  ShieldCheck,
  CreditCard,
  Lock,
  KeyRound,
  Edit2,
  Camera,
  MapPin,
  Package,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import serverApi from '@/src/lib/api'
import { uploadImage } from '@/src/lib/upload'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()

  // State Update Profile
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || ''
  })

  // State Change Password
  const [isPassOpen, setIsPassOpen] = useState(false)
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isPassLoading, setIsPassLoading] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // LOGIC UPLOAD & UPDATE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Ảnh quá lớn!')
      setSelectedFile(file)
      setPreviewAvatar(URL.createObjectURL(file))
    }
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      let finalAvatarUrl = formData.avatar
      if (selectedFile) finalAvatarUrl = await uploadImage(selectedFile)
      const res = await serverApi.put('/public/profile', {
        ...formData,
        avatar: finalAvatarUrl
      })
      updateUser(res.data)
      toast.success('Cập nhật thành công!')
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passData.currentPassword || !passData.newPassword)
      return toast.error('Nhập đủ thông tin')
    if (passData.newPassword !== passData.confirmPassword)
      return toast.error('Mật khẩu xác nhận không khớp')

    setIsPassLoading(true)
    try {
      await serverApi.put('/public/customer-auth/change-password', passData)
      toast.success('Đổi mật khẩu thành công!')
      setIsPassOpen(false)
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Lỗi đổi mật khẩu')
    } finally {
      setIsPassLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* 1. THÔNG TIN CHUNG */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Hồ sơ của tôi</h2>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý thông tin hồ sơ để bảo mật tài khoản
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm"
              >
                <Edit2 className="w-4 h-4 mr-2" /> Cập nhật
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white text-gray-900 z-[9999]">
              <DialogHeader>
                <DialogTitle>Cập nhật thông tin</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex justify-center">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Avatar className="w-24 h-24 border-2">
                      <AvatarImage
                        src={previewAvatar}
                        className="object-cover"
                      />
                      <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Camera className="text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="space-y-3">
                  <div className="grid gap-2">
                    <Label>Họ tên</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="bg-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>SĐT</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="bg-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Địa chỉ mặc định</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="bg-orange-600 text-white hover:bg-orange-700"
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Separator className="my-6" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-gray-500">Tên hiển thị</label>
            <div className="font-medium text-gray-900 text-lg flex items-center gap-2">
              {user.name} <ShieldCheck className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">Email</label>
            <div className="font-medium text-gray-900 text-lg">
              {user.email}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">Số điện thoại</label>
            <div className="font-medium text-gray-900 text-lg">
              {user.phone || (
                <span className="text-gray-400 italic font-normal text-sm">
                  Chưa cập nhật
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">Vai trò</label>
            <div className="font-medium text-gray-900 text-lg uppercase">
              {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. BẢO MẬT */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Lock size={20} className="text-orange-500" /> Bảo mật tài khoản
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Đổi mật khẩu định kỳ để bảo vệ tài khoản
            </p>
          </div>
          <Dialog open={isPassOpen} onOpenChange={setIsPassOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Đổi mật khẩu</Button>
            </DialogTrigger>
            <DialogContent className="bg-white text-gray-900 z-[9999]">
              <DialogHeader>
                <DialogTitle>Đổi mật khẩu</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <Input
                  type="password"
                  placeholder="Mật khẩu cũ"
                  className="bg-white"
                  value={passData.currentPassword}
                  onChange={(e) =>
                    setPassData({
                      ...passData,
                      currentPassword: e.target.value
                    })
                  }
                />
                <Input
                  type="password"
                  placeholder="Mật khẩu mới"
                  className="bg-white"
                  value={passData.newPassword}
                  onChange={(e) =>
                    setPassData({ ...passData, newPassword: e.target.value })
                  }
                />
                <Input
                  type="password"
                  placeholder="Xác nhận mới"
                  className="bg-white"
                  value={passData.confirmPassword}
                  onChange={(e) =>
                    setPassData({
                      ...passData,
                      confirmPassword: e.target.value
                    })
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={handleChangePassword}
                  disabled={isPassLoading}
                  className="bg-orange-600 text-white hover:bg-orange-700"
                >
                  Xác nhận
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 3. STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {user.ordersCount || 0}
            </div>
            <div className="text-sm text-gray-500">Đơn hàng</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {(user.totalSpent || 0).toLocaleString()}₫
            </div>
            <div className="text-sm text-gray-500">Tổng chi tiêu</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <MapPin size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">--</div>
            <div className="text-sm text-gray-500">Sổ địa chỉ</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/src/store/authStore'
import {
  LogOut,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  Gift,
  Loader2,
  Camera,
  Edit2,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Lock,
  KeyRound // Thêm Icon KeyRound, Lock
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

// Component Menu Item
const NavItem = ({ href, icon: Icon, label, active = false }: any) => (
  <Link
    href={href}
    className={`flex items-center justify-between p-3 rounded-lg transition-all group ${
      active
        ? 'bg-orange-50 text-orange-600 border border-orange-100 font-medium'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon
        size={18}
        className={
          active ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'
        }
      />
      <span>{label}</span>
    </div>
    {active && <ChevronRight size={16} />}
  </Link>
)

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateUser } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // State cho Update Profile
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: ''
  })

  // State cho Change Password (MỚI)
  const [isPassOpen, setIsPassOpen] = useState(false)
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isPassLoading, setIsPassLoading] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewAvatar, setPreviewAvatar] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || ''
      })
      setPreviewAvatar(user.avatar || '')
      setSelectedFile(null)
    }
  }, [user, isOpen])

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/login')
  }, [isAuthenticated, router, mounted])

  if (!mounted || !user)
    return (
      <div className="flex h-[60vh] w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )

  // Xử lý upload ảnh (Giữ nguyên)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Ảnh quá lớn!')
      setSelectedFile(file)
      setPreviewAvatar(URL.createObjectURL(file))
    }
  }

  // API Update Info (Giữ nguyên)
  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      let finalAvatarUrl = formData.avatar
      if (selectedFile) {
        finalAvatarUrl = await uploadImage(selectedFile)
      }
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

  // API Change Password (MỚI)
  const handleChangePassword = async () => {
    if (!passData.currentPassword || !passData.newPassword)
      return toast.error('Vui lòng nhập đầy đủ thông tin')
    if (passData.newPassword !== passData.confirmPassword)
      return toast.error('Mật khẩu xác nhận không khớp')
    if (passData.newPassword.length < 6)
      return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')

    setIsPassLoading(true)
    try {
      // Gọi API đổi pass (Bạn cần tạo route này ở backend sau bước này)
      await serverApi.put('/public/customer-auth/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      })
      toast.success('Đổi mật khẩu thành công!')
      setIsPassOpen(false)
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Mật khẩu hiện tại không đúng')
    } finally {
      setIsPassLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 md:hidden">
          <h1 className="text-2xl font-bold text-gray-900">
            Xin chào, {user.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SIDEBAR (GIỮ NGUYÊN) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-4">
                <Avatar className="w-full h-full border-4 border-orange-50">
                  <AvatarImage
                    src={previewAvatar || user.avatar || ''}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => setIsOpen(true)}
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow border border-gray-200 text-gray-600 hover:text-orange-600"
                >
                  <Edit2 size={14} />
                </button>
              </div>
              <h2 className="font-bold text-lg text-gray-900 truncate w-full">
                {user.name}
              </h2>
              <p className="text-sm text-gray-500 mb-4 truncate w-full">
                {user.email}
              </p>
              <div className="w-full bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                <div className="flex justify-between items-center text-xs font-semibold text-orange-800 uppercase tracking-wider mb-1">
                  <span>{user.loyaltyTier || 'Member'}</span>
                  <Gift size={14} />
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {user.loyaltyPoints?.toLocaleString() ?? 0}{' '}
                  <span className="text-xs font-medium text-orange-500">
                    điểm
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-1 hidden lg:block">
              <NavItem
                href="/profile"
                icon={User}
                label="Thông tin tài khoản"
                active={true}
              />
              <NavItem
                href="/profile/orders"
                icon={Package}
                label="Đơn hàng của tôi"
              />
              <NavItem
                href="/profile/addresses"
                icon={MapPin}
                label="Sổ địa chỉ"
              />
              <Separator className="my-2" />
              <button
                onClick={() => {
                  logout()
                  router.push('/')
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* CONTENT (BÊN PHẢI) */}
          <div className="lg:col-span-9 space-y-6">
            {/* 1. THÔNG TIN CHUNG */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Hồ sơ của tôi
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Quản lý thông tin hồ sơ để bảo mật tài khoản
                  </p>
                </div>

                {/* EDIT PROFILE DIALOG */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm">
                      <Edit2 className="w-4 h-4 mr-2" /> Cập nhật
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-white text-gray-900 z-[9999]">
                    <DialogHeader>
                      <DialogTitle>Cập nhật thông tin</DialogTitle>
                      <DialogDescription>
                        Thay đổi thông tin cá nhân của bạn.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="flex justify-center">
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Avatar className="w-24 h-24 border-2 border-gray-200">
                            <AvatarImage
                              src={previewAvatar || user.avatar || ''}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gray-100 text-2xl">
                              {user.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
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
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Họ và tên</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="bg-white text-gray-900 border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Số điện thoại</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value
                              })
                            }
                            className="bg-white text-gray-900 border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Địa chỉ mặc định</Label>
                          <Input
                            value={formData.address}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: e.target.value
                              })
                            }
                            className="bg-white text-gray-900 border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="bg-orange-600 text-white hover:bg-orange-700 w-full"
                      >
                        {isLoading && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}{' '}
                        Lưu thay đổi
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator className="my-6 bg-gray-100" />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">Tên hiển thị</label>
                  <div className="font-medium text-gray-900 text-lg flex items-center gap-2">
                    {user.name}{' '}
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">Email</label>
                  <div className="font-medium text-gray-900 text-lg flex items-center gap-2">
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
                    {user.role === 'admin'
                      ? 'Quản trị viên'
                      : 'Khách hàng thân thiết'}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. BẢO MẬT (ĐỔI MẬT KHẨU) - MỚI */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Lock size={20} className="text-orange-500" /> Bảo mật tài
                    khoản
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho
                    người khác
                  </p>
                </div>

                {/* CHANGE PASS DIALOG */}
                <Dialog open={isPassOpen} onOpenChange={setIsPassOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm"
                    >
                      Đổi mật khẩu
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px] bg-white text-gray-900 z-[9999]">
                    <DialogHeader>
                      <DialogTitle>Đổi mật khẩu</DialogTitle>
                      <DialogDescription>
                        Nhập mật khẩu hiện tại và mật khẩu mới.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Mật khẩu hiện tại</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="password"
                            value={passData.currentPassword}
                            onChange={(e) =>
                              setPassData({
                                ...passData,
                                currentPassword: e.target.value
                              })
                            }
                            className="pl-9 bg-white text-gray-900 border-gray-300"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Mật khẩu mới</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="password"
                            value={passData.newPassword}
                            onChange={(e) =>
                              setPassData({
                                ...passData,
                                newPassword: e.target.value
                              })
                            }
                            className="pl-9 bg-white text-gray-900 border-gray-300"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Xác nhận mật khẩu mới</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="password"
                            value={passData.confirmPassword}
                            onChange={(e) =>
                              setPassData({
                                ...passData,
                                confirmPassword: e.target.value
                              })
                            }
                            className="pl-9 bg-white text-gray-900 border-gray-300"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleChangePassword}
                        disabled={isPassLoading}
                        className="bg-orange-600 text-white hover:bg-orange-700 w-full"
                      >
                        {isPassLoading && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}{' '}
                        Xác nhận đổi
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* 3. QUICK STATS (GIỮ NGUYÊN) */}
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
                  <div className="text-2xl font-bold text-gray-900">1</div>
                  <div className="text-sm text-gray-500">Sổ địa chỉ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

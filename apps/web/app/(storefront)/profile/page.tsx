/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  Edit2
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
import serverApi from '@/src/lib/serverApi'
import { uploadImage } from '@/src/lib/upload'

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateUser } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: ''
  })

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

  if (!mounted || !user) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB')
        return
      }
      setSelectedFile(file)
      const objectUrl = URL.createObjectURL(file)
      setPreviewAvatar(objectUrl)
    }
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      let finalAvatarUrl = formData.avatar

      if (selectedFile) {
        try {
          finalAvatarUrl = await uploadImage(selectedFile)
        } catch (err) {
          toast.error('Lỗi upload ảnh')
          setIsLoading(false)
          return
        }
      }

      const payload = { ...formData, avatar: finalAvatarUrl }
      const res = await serverApi.put('/public/profile', payload)

      updateUser(res.data)
      toast.success('Cập nhật thành công!')
      setIsOpen(false)
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  const displayAvatar =
    previewAvatar || user.avatar || '/avatar-placeholder.png'

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Hồ sơ cá nhân</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
            <div
              className="relative w-24 h-24 mb-4 group cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              <img
                src={displayAvatar}
                alt={user.name}
                className="w-full h-full object-cover rounded-full border-4 border-orange-100 bg-gray-100"
                onError={(e) => {
                  e.currentTarget.src = 'https://github.com/shadcn.png'
                }}
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-6 h-6" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mt-1">
              {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </p>

            <div className="mt-4 flex flex-col gap-2 w-full">
              <div className="bg-orange-50 text-orange-700 py-2 px-4 rounded-lg text-sm font-bold flex justify-between items-center">
                <span>Điểm thưởng:</span>
                <span>{user.loyaltyPoints?.toLocaleString() ?? 0}</span>
              </div>
              <div className="bg-yellow-50 text-yellow-700 py-2 px-4 rounded-lg text-sm font-bold flex justify-between items-center">
                <span>Hạng:</span>
                <span className="uppercase">
                  {user.loyaltyTier ?? 'Member'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <a
              href="/loyalty"
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-100"
            >
              <Gift className="text-indigo-500" size={20} />
              <span className="font-medium text-gray-700">
                Đổi quà & Ưu đãi
              </span>
            </a>
            <a
              href="/tracking"
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-100"
            >
              <Package className="text-blue-500" size={20} />
              <span className="font-medium text-gray-700">Đơn mua gần đây</span>
            </a>
            <button
              onClick={() => {
                logout()
                router.push('/')
              }}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition !text-red-600 font-medium"
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                <User className="text-orange-500" /> Thông tin tài khoản
              </h3>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  >
                    <Edit2 size={14} /> Chỉnh sửa
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[500px] bg-white text-gray-900 border-gray-200 shadow-xl z-[9999]">
                  {/* 🔥 FIX: Thêm z-[9999] ở đây */}
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 font-bold text-xl">
                      Cập nhật hồ sơ
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Thay đổi thông tin cá nhân của bạn.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="relative w-24 h-24 cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <img
                          src={previewAvatar || 'https://github.com/shadcn.png'}
                          alt="Preview"
                          className="w-full h-full rounded-full object-cover border-2 border-gray-200 bg-gray-50"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://github.com/shadcn.png'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="text-white w-6 h-6" />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
                      >
                        Tải ảnh mới
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>

                    {/* 🟢 ÉP STYLE LIGHT MODE CHO INPUT */}
                    <div className="grid gap-2">
                      <Label
                        htmlFor="name"
                        className="text-gray-700 font-medium"
                      >
                        Họ và tên
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        // Thêm style inline hoặc class để override dark mode
                        className="bg-white! text-gray-900 border-gray-300 focus-visible:ring-orange-500 placeholder:text-gray-400"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="phone"
                        className="text-gray-700 font-medium"
                      >
                        Số điện thoại
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="bg-white! text-gray-900 border-gray-300 focus-visible:ring-orange-500 placeholder:text-gray-400"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="address"
                        className="text-gray-700 font-medium"
                      >
                        Địa chỉ
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="bg-white! text-gray-900 border-gray-300 focus-visible:ring-orange-500 placeholder:text-gray-400"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto font-medium shadow-md"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4 mr-2" />
                          {selectedFile ? 'Đang tải ảnh...' : 'Đang lưu...'}
                        </>
                      ) : (
                        'Lưu thay đổi'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Địa chỉ Email
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Mail className="text-gray-400" size={18} />
                  <span className="font-semibold text-gray-900">
                    {user.email}
                  </span>
                </div>
                <p className="text-xs text-orange-600 mt-2">
                  * Email không thể thay đổi.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Số điện thoại
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Phone className="text-gray-400" size={18} />
                  <span className="font-medium text-gray-900">
                    {user.phone || 'Chưa cập nhật'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Địa chỉ mặc định
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="text-gray-400" size={18} />
                  <span className="font-medium text-gray-900">
                    {user.address || 'Chưa cập nhật'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

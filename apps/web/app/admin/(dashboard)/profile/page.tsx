/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAdminAuthStore } from '@/src/store/adminAuthStore' // 👈 Sửa import
import api from '@/src/lib/api'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // 👇 Lấy hàm setAdminAuth từ Store Admin để update thông tin local
  const { admin, setAdminAuth, token } = useAdminAuthStore()

  const { register, handleSubmit, setValue } = useForm()
  const { register: registerPass, handleSubmit: handleSubmitPass } = useForm()

  /* =============================================
     LOAD PROFILE
  ============================================= */
  const loadProfile = async () => {
    try {
      // Gọi API lấy profile mới nhất
      const res = await api.get('/admin/profile')
      const data = res.data

      setValue('name', data.name)
      setValue('email', data.email)
      setAvatarPreview(data.avatar)

      // 👇 SỬA LẠI ĐOẠN NÀY:
      // Đừng dùng data trần, hãy merge với admin cũ để giữ lại Permissions/Role
      if (token && admin) {
        setAdminAuth(token, {
          ...admin, // Giữ lại role, permissions, id... của admin cũ
          ...data // Chỉ cập nhật name, avatar, email mới đè lên
        })
      }

      setLoading(false)
    } catch (err) {
      console.error(err) // Log lỗi ra xem cho dễ
      toast.error('Không thể tải thông tin user')
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  /* =============================================
     UPDATE PROFILE
  ============================================= */
  const onSubmitProfile = async (values: any) => {
    try {
      await api.put('/admin/profile', values)
      toast.success('Cập nhật thành công')
      loadProfile() // Load lại để update store
    } catch {
      toast.error('Cập nhật thất bại')
    }
  }

  /* =============================================
     CHANGE PASSWORD
  ============================================= */
  const onSubmitPassword = async (values: any) => {
    try {
      await api.put('/admin/profile/change-password', values)
      toast.success('Đổi mật khẩu thành công')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Đổi mật khẩu thất bại')
    }
  }

  /* =============================================
     UPLOAD AVATAR
  ============================================= */
  const onAvatarChange = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    // preview ngay
    setAvatarPreview(URL.createObjectURL(file))

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await api.post('/admin/profile/avatar', form)
      const data = res.data // { avatar: 'url...' }

      // Cập nhật avatar vào store ngay lập tức
      if (admin && token) {
        setAdminAuth(token, { ...admin, avatar: data.avatar })
      }

      toast.success('Cập nhật avatar thành công')
    } catch {
      toast.error('Upload avatar thất bại')
    }
  }

  if (loading) return <p className="p-6">Đang tải...</p>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* PROFILE */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={avatarPreview || '/default-avatar.png'}
              className="w-20 h-20 rounded-full object-cover border"
              alt="avatar"
            />

            <div>
              <Input type="file" onChange={onAvatarChange} />
              <p className="text-xs text-gray-500 mt-1">
                Chọn ảnh để thay avatar
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tên hiển thị</label>
            <Input {...register('name', { required: true })} />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              {...register('email', { required: true })}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <Button onClick={handleSubmit(onSubmitProfile)}>Cập nhật</Button>
        </CardContent>
      </Card>

      {/* PASSWORD */}
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Input
            type="password"
            placeholder="Mật khẩu hiện tại"
            {...registerPass('oldPassword', { required: true })}
          />

          <Input
            type="password"
            placeholder="Mật khẩu mới"
            {...registerPass('newPassword', { required: true })}
          />

          <Input
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            {...registerPass('confirmNewPassword', { required: true })}
          />

          <Button onClick={handleSubmitPass(onSubmitPassword)}>
            Đổi mật khẩu
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

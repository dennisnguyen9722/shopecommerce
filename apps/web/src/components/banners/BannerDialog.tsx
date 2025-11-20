/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { toast } from 'sonner'
import api from '@/src/lib/api'

interface Banner {
  _id?: string
  imageUrl: string
  title?: string
  subtitle?: string
  link?: string
  position?: string
  order?: number
  isActive: boolean
}

interface BannerDialogProps {
  open: boolean
  onClose: () => void
  data?: Banner | null
  onSaved: () => void
}

export default function BannerDialog({
  open,
  onClose,
  data,
  onSaved
}: BannerDialogProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('') // local preview
  const [file, setFile] = useState<File | null>(null)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [link, setLink] = useState('')

  const [position, setPosition] = useState('homepage')
  const [order, setOrder] = useState(1)
  const [isActive, setIsActive] = useState(true)

  // -----------------------------------------------------
  // LOAD DATA (Edit Mode)
  // -----------------------------------------------------
  useEffect(() => {
    if (!open) return

    if (data) {
      setImageUrl(data.imageUrl || '')
      setPreviewUrl('') // only show preview if user picks new file
      setTitle(data.title || '')
      setSubtitle(data.subtitle || '')
      setLink(data.link || '')
      setPosition(data.position || 'homepage')
      setOrder(data.order || 1)
      setIsActive(Boolean(data.isActive))
      setFile(null)
    } else {
      setImageUrl('')
      setPreviewUrl('')
      setTitle('')
      setSubtitle('')
      setLink('')
      setPosition('homepage')
      setOrder(1)
      setIsActive(true)
      setFile(null)
    }
  }, [open, data])

  // -----------------------------------------------------
  // HANDLE FILE CHANGE → SHOW PREVIEW
  // -----------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  // -----------------------------------------------------
  // UPLOAD IMAGE
  // -----------------------------------------------------
  const uploadImage = async (): Promise<string | null> => {
    if (!file) return null

    const form = new FormData()
    form.append('images', file)

    try {
      const res = await api.post('/admin/products/upload', form)
      return res.data?.images?.[0]?.url || null
    } catch {
      toast.error('Upload ảnh thất bại')
      return null
    }
  }

  // -----------------------------------------------------
  // SUBMIT
  // -----------------------------------------------------
  const handleSubmit = async () => {
    try {
      let finalImage = imageUrl

      if (file) {
        const uploaded = await uploadImage()
        if (uploaded) finalImage = uploaded
      }

      const payload = {
        imageUrl: finalImage,
        title,
        subtitle,
        link,
        position,
        order,
        isActive
      }

      // update
      if (data?._id) {
        await api.put(`/admin/banners/${data._id}`, payload)
        toast.success('Đã cập nhật banner')
      }
      // create
      else {
        await api.post('/admin/banners', payload)
        toast.success('Đã tạo banner mới')
      }

      onSaved()
      onClose()
    } catch (error: unknown) {
      const message = (error as any)?.response?.data?.error || 'Có lỗi xảy ra'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          max-w-xl rounded-xl
          p-0 
          overflow-hidden
        "
      >
        <div
          className="
            max-h-[80vh] 
            overflow-y-auto
            px-6 py-6
            space-y-6
            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {data ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
            </DialogTitle>
          </DialogHeader>

          {/* IMAGE UPLOAD */}
          <div className="space-y-2">
            <Label className="font-medium">Ảnh Banner</Label>

            <div className="w-full h-48 bg-gray-100 border rounded-lg flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" />
              ) : imageUrl ? (
                <img src={imageUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-500 text-sm">
                  Chưa có ảnh — hãy chọn ảnh
                </div>
              )}
            </div>

            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          {/* TITLE */}
          <div className="space-y-1">
            <Label>Tiêu đề</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* SUBTITLE */}
          <div className="space-y-1">
            <Label>Phụ đề</Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          {/* LINK */}
          <div className="space-y-1">
            <Label>Link khi bấm vào</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} />
          </div>

          {/* POSITION */}
          <div className="space-y-1">
            <Label>Vị trí hiển thị</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vị trí" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homepage">
                  Trang chủ – Hero Slider
                </SelectItem>
                <SelectItem value="homepage-secondary">
                  Trang chủ – Banner phụ
                </SelectItem>
                <SelectItem value="category">Trang danh mục</SelectItem>
                <SelectItem value="product">Trang sản phẩm</SelectItem>
                <SelectItem value="popup">Popup quảng cáo</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Banner sẽ xuất hiện đúng tại khu vực được chọn.
            </p>
          </div>

          {/* ORDER */}
          <div className="space-y-1">
            <Label>Thứ tự hiển thị</Label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>

          {/* ACTIVE */}
          <div className="flex items-center justify-between">
            <Label>Hiển thị banner</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>Lưu</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

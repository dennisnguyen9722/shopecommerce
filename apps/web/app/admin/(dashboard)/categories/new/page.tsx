'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import api from '@/src/lib/api'

import GlassCard from '@/src/components/admin/GlassCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'

import ImageUploader from '@/src/components/admin/ImageUploader'

export default function CreateCategoryPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState<'active' | 'inactive'>('active')
  const [parent, setParent] = useState('none')

  const [icon, setIcon] = useState<{ url: string; public_id: string } | null>(
    null
  )

  const handleName = (value: string) => {
    setName(value)
    setSlug(
      value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
    )
  }

  const mut = useMutation({
    mutationFn: async () => {
      const res = await api.post('/admin/categories', {
        name,
        slug,
        description,
        parent: parent === 'none' ? null : parent,
        isActive: isActive === 'active',
        icon: icon ? { url: icon.url, public_id: icon.public_id } : null
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Tạo danh mục thành công!')
      router.push('/admin/categories')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Lỗi khi tạo danh mục!')
    }
  })

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            Danh mục / Tạo mới
          </div>
          <h1 className="text-2xl font-semibold mt-1 dark:text-gray-900">
            Tạo danh mục
          </h1>
        </div>
        <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
          {mut.isPending ? 'Đang tạo...' : 'Tạo danh mục'}
        </Button>
      </div>

      {/* FORM */}
      <GlassCard className="p-6 space-y-6">
        {/* NAME */}
        <div className="space-y-2">
          <Label>Tên danh mục</Label>
          <Input
            value={name}
            onChange={(e) => handleName(e.target.value)}
            placeholder="Ví dụ: Điện thoại"
          />
        </div>

        {/* SLUG */}
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="dien-thoai"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <Label>Mô tả</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn..."
          />
        </div>

        {/* STATUS */}
        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <Select
            value={isActive}
            onValueChange={(v: 'active' | 'inactive') => setIsActive(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hiển thị</SelectItem>
              <SelectItem value="inactive">Ẩn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PARENT */}
        <div className="space-y-2">
          <Label>Danh mục cha</Label>
          <Select value={parent} onValueChange={(v) => setParent(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Không có" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không có</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ICON UPLOADER */}
        <div className="space-y-3">
          <Label>Icon danh mục (tuỳ chọn)</Label>

          {/* ⭐ Không có max → tự giới hạn bằng logic */}
          <ImageUploader
            initial={icon ? [icon] : []}
            onChange={(imgs) => setIcon(imgs[0] || null)}
          />

          {icon && (
            <div className="flex items-center gap-3 mt-2">
              <img
                src={icon.url}
                alt="icon"
                className="w-10 h-10 object-contain rounded"
              />
              <Button variant="outline" size="sm" onClick={() => setIcon(null)}>
                Xoá icon
              </Button>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}

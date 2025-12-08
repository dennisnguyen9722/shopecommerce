/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { use } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

export default function EditCategoryPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [parent, setParent] = useState('none')

  // ⭐ ICON FIELD
  const [icon, setIcon] = useState<{ url: string; public_id: string } | null>(
    null
  )

  // FETCH CATEGORY
  const { data, isLoading } = useQuery({
    queryKey: ['admin-category', id],
    queryFn: async () => {
      const res = await api.get(`/admin/categories/${id}`)
      return res.data
    }
  })

  useEffect(() => {
    if (!data) return

    setName(data.name)
    setSlug(data.slug)
    setDescription(data.description || '')
    setStatus(data.isActive ? 'active' : 'inactive')
    setParent(data.parent || 'none')

    // ⭐ Load icon
    if (data.icon) setIcon(data.icon)
  }, [data])

  // UPDATE CATEGORY
  const mut = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/admin/categories/${id}`, {
        name,
        slug,
        description,
        parent: parent === 'none' ? null : parent,
        isActive: status === 'active',
        icon: icon ? { url: icon.url, public_id: icon.public_id } : null
      })

      return res.data
    },
    onSuccess: () => {
      toast.success('Lưu danh mục thành công!')
      queryClient.invalidateQueries({ queryKey: ['admin-category', id] })
    },
    onError: () => {
      toast.error('Lỗi khi lưu danh mục!')
    }
  })

  if (isLoading) return <div className="p-6">Đang tải danh mục...</div>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            Danh mục / {data?.name}
          </div>
          <h1 className="text-2xl font-semibold mt-1 dark:text-gray-900">
            Chỉnh sửa danh mục
          </h1>
        </div>
        <Button
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
          className="px-6"
        >
          {mut.isPending ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>

      {/* FORM */}
      <GlassCard className="p-6 space-y-6">
        {/* TÊN */}
        <div className="space-y-2">
          <Label>Tên danh mục</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên danh mục"
          />
        </div>

        {/* SLUG */}
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ten-danh-muc"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <Label>Mô tả</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả danh mục"
          />
        </div>

        {/* STATUS */}
        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <Select
            value={status}
            onValueChange={(v: 'active' | 'inactive') => setStatus(v)}
          >
            <SelectTrigger>
              <SelectValue />
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
              {/* TODO: render danh mục cha */}
            </SelectContent>
          </Select>
        </div>

        {/* ⭐ ICON UPLOAD */}
        <div className="space-y-3">
          <Label>Icon danh mục</Label>

          <ImageUploader
            initial={icon ? [icon] : []}
            onChange={(imgs) => setIcon(imgs[0] || null)}
          />

          {icon && (
            <div className="flex items-center gap-4 mt-2">
              <img
                src={icon.url}
                alt="icon"
                className="w-12 h-12 object-contain rounded"
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

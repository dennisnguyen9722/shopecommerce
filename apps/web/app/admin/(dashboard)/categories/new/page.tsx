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

export default function CreateCategoryPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [parent, setParent] = useState('none')

  const makeSlug = (val: string) =>
    val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')

  const mut = useMutation({
    mutationFn: async () => {
      const res = await api.post('/admin/categories', {
        name,
        slug,
        isActive: status === 'active',
        parent: parent === 'none' ? null : parent
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Tạo danh mục thành công!')
      router.push('/admin/categories')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Lỗi tạo danh mục!')
    }
  })

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tạo danh mục mới
          </h1>
          <p className="text-sm text-muted-foreground">
            Thêm danh mục sản phẩm vào hệ thống.
          </p>
        </div>
      </div>

      {/* FORM CARD */}
      <GlassCard className="p-6 space-y-6">
        <div className="space-y-2">
          <Label>Tên danh mục</Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSlug(makeSlug(e.target.value))
            }}
            placeholder="Ví dụ: Áo thun"
          />
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ao-thun"
          />
        </div>

        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <Select
            value={status}
            onValueChange={(v: 'active' | 'inactive') => setStatus(v)}
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

        <div className="space-y-2">
          <Label>Danh mục cha</Label>
          <Select value={parent} onValueChange={(v) => setParent(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Không có danh mục cha" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="none">Không có</SelectItem>
              {/* tải danh mục cha nếu bạn muốn */}
              {/* <SelectItem value="id">Tên danh mục</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {/* BUTTONS */}
        <div className="pt-4 flex justify-end">
          <Button
            onClick={() => mut.mutate()}
            className="px-6 shadow-md"
            disabled={mut.isPending}
          >
            {mut.isPending ? 'Đang tạo...' : 'Tạo danh mục'}
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}

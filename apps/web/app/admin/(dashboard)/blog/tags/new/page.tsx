'use client'

import { useState } from 'react'
import api from '@/src/lib/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import GlassCard from '@/src/components/admin/GlassCard'

export default function NewTagPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    // chỉ auto-fill nếu slug đang trống, không phá người dùng
    if (!slug) {
      const gen = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(gen)
    }
  }

  async function createTag() {
    try {
      setLoading(true)
      await api.post('/admin/blog/tags', { name, slug })

      toast.success('Tạo tag thành công!')
      router.push('/admin/blog/tags')
    } catch (e) {
      toast.error('Không thể tạo tag')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold dark:text-gray-900">Tạo tag mới</h1>

      <GlassCard className="p-5 space-y-4">
        <div className="space-y-2">
          <Label>Tên tag</Label>
          <Input
            placeholder="VD: sneaker, giày đẹp"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            placeholder="vd: sneaker"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Slug dùng cho URL, có thể chỉnh sửa trước khi lưu.
          </p>
        </div>

        <Button onClick={createTag} disabled={loading} className="w-full">
          {loading ? 'Đang tạo...' : 'Tạo tag'}
        </Button>
      </GlassCard>
    </div>
  )
}

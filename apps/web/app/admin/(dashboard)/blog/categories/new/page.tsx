'use client'

import { useState } from 'react'
import api from '@/src/lib/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import GlassCard from '@/src/components/admin/GlassCard'

export default function NewCategoryPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)

  const slugify = (value: string) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  async function createCategory() {
    try {
      setLoading(true)
      await api.post('/admin/blog/categories', { name, slug })

      toast.success('Tạo danh mục thành công!')
      router.push('/admin/blog/categories')
    } catch {
      toast.error('Không thể tạo danh mục')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Tạo danh mục mới</h1>

      <GlassCard className="p-5 space-y-5">
        <div className="space-y-2">
          <Label>Tên danh mục</Label>
          <Input
            placeholder="VD: Đánh giá giày"
            value={name}
            onChange={(e) => {
              const v = e.target.value
              setName(v)
              setSlug(slugify(v))
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            placeholder="tu-dong-tao-theo-ten"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>

        <Button onClick={createCategory} disabled={loading} className="w-full">
          {loading ? 'Đang tạo...' : 'Tạo danh mục'}
        </Button>
      </GlassCard>
    </div>
  )
}

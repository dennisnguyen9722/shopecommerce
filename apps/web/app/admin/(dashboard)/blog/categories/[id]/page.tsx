'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/src/lib/api'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import GlassCard from '@/src/components/admin/GlassCard'

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const slugify = (value: string) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  async function loadCategory() {
    try {
      const { data } = await api.get(`/admin/blog/categories/${id}`)
      setName(data.name)
      setSlug(data.slug)
    } catch {
      toast.error('Không tìm thấy danh mục')
      router.push('/admin/blog/categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategory()
  }, [])

  async function saveCategory() {
    try {
      setSaving(true)
      await api.put(`/admin/blog/categories/${id}`, { name })
      toast.success('Đã lưu thay đổi!')
    } catch {
      toast.error('Lưu thất bại!')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCategory() {
    if (!confirm('Bạn có chắc muốn xoá danh mục này?')) return

    try {
      setDeleting(true)
      await api.delete(`/admin/blog/categories/${id}`)
      toast.success('Đã xoá danh mục!')
      router.push('/admin/blog/categories')
    } catch {
      toast.error('Không thể xoá')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <p className="p-6">Đang tải...</p>

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-gray-900">
          Chỉnh sửa danh mục
        </h1>
        <Button
          variant="destructive"
          onClick={deleteCategory}
          disabled={deleting}
        >
          {deleting ? 'Đang xoá...' : 'Xoá'}
        </Button>
      </div>

      {/* FORM */}
      <GlassCard className="p-5 space-y-5">
        <div className="space-y-2">
          <Label>Tên danh mục</Label>
          <Input
            value={name}
            onChange={(e) => {
              const v = e.target.value
              setName(v)

              // tự tạo slug từ tên
              setSlug(slugify(v))
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Slug (tự tạo theo tên)</Label>
          <Input value={slug} disabled className="bg-muted" />
        </div>

        <Button onClick={saveCategory} disabled={saving} className="w-full">
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </GlassCard>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/src/lib/api'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import GlassCard from '@/src/components/admin/GlassCard'

export default function EditTagPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadTag()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTag() {
    try {
      const { data } = await api.get(`/admin/blog/tags/${id}`)
      setName(data.name)
      setSlug(data.slug)
    } catch {
      toast.error('Không tìm thấy tag')
      router.push('/admin/blog/tags')
    } finally {
      setLoading(false)
    }
  }

  async function saveTag() {
    try {
      setSaving(true)
      await api.put(`/admin/blog/tags/${id}`, { name })
      toast.success('Đã lưu thay đổi!')
    } catch {
      toast.error('Lưu thất bại!')
    } finally {
      setSaving(false)
    }
  }

  async function deleteTag() {
    if (!confirm('Bạn có chắc muốn xoá tag này?')) return

    try {
      setDeleting(true)
      await api.delete(`/admin/blog/tags/${id}`)
      toast.success('Đã xoá tag!')
      router.push('/admin/blog/tags')
    } catch {
      toast.error('Không thể xoá')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <p className="p-6">Đang tải...</p>

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-gray-900">
          Chỉnh sửa tag
        </h1>
        <Button variant="destructive" onClick={deleteTag} disabled={deleting}>
          {deleting ? 'Đang xoá...' : 'Xoá'}
        </Button>
      </div>

      <GlassCard className="p-5 space-y-4">
        <div className="space-y-2">
          <Label>Tên tag</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: sneaker"
          />
        </div>

        <div className="space-y-2">
          <Label>Slug (tự tạo)</Label>
          <Input value={slug} disabled className="bg-muted/60" />
          <p className="text-xs text-muted-foreground">
            Slug được tạo ở lúc khởi tạo tag, không chỉnh sửa tại đây.
          </p>
        </div>

        <Button onClick={saveTag} disabled={saving} className="w-full">
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </GlassCard>
    </div>
  )
}

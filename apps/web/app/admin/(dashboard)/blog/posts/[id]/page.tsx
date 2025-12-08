'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/src/lib/api'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import GlassCard from '@/src/components/admin/GlassCard'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

import SingleImageUploader from '@/src/components/admin/SingleImageUploader'
import { toast } from 'sonner'
import Editor from '@/src/components/editor/Editor'

type BlogStatus = 'draft' | 'published' | 'archived'

type BlogCategory = {
  _id: string
  name: string
}

type BlogTag = {
  _id: string
  name: string
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  // MAIN FIELDS
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')

  // THUMBNAIL
  const [thumbnailUrl, setThumbnailUrl] = useState('')

  // META
  const [status, setStatus] = useState<BlogStatus>('draft')
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [tagIds, setTagIds] = useState<string[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setErr('')

        const [catsRes, tagsRes, postRes] = await Promise.all([
          api.get('/admin/blog/categories'),
          api.get('/admin/blog/tags'),
          api.get(`/admin/blog/posts/${id}`)
        ])

        // categories có thể là array hoặc {items: []}
        const catsData = Array.isArray(catsRes.data)
          ? catsRes.data
          : catsRes.data.items || []

        const tagsData = Array.isArray(tagsRes.data)
          ? tagsRes.data
          : tagsRes.data.items || []

        setCategories(catsData)
        setTags(tagsData)

        const data = postRes.data
        setTitle(data.title || '')
        setSlug(data.slug || '')
        setExcerpt(data.excerpt || '')
        setContent(data.content || '')
        setThumbnailUrl(data.thumbnailUrl || '')
        setStatus((data.status as BlogStatus) || 'draft')

        // categories & tags: populated array object
        const catIds =
          Array.isArray(data.categories) && data.categories.length
            ? data.categories.map((c: any) =>
                typeof c === 'string' ? c : c._id
              )
            : []
        const tagIdsArr =
          Array.isArray(data.tags) && data.tags.length
            ? data.tags.map((t: any) => (typeof t === 'string' ? t : t._id))
            : []

        setCategoryIds(catIds)
        setTagIds(tagIdsArr)
      } catch (error: any) {
        const message =
          error?.response?.data?.message || 'Không tải được thông tin bài viết'
        setErr(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  async function saveChanges() {
    try {
      setSaving(true)
      setErr('')

      await api.put(`/admin/blog/posts/${id}`, {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content,
        thumbnailUrl,
        status,
        categories: categoryIds,
        tags: tagIds
      })

      toast.success('Lưu bài viết thành công!')
      router.refresh()
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể lưu bài viết'
      setErr(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Đang tải...</div>
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight dark:text-gray-900">
            Chỉnh sửa bài viết
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            ID: <span className="font-mono">{id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push('/admin/blog/posts')}
          >
            Quay lại danh sách
          </Button>
          <Button onClick={saveChanges} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      {err && (
        <GlassCard className="border-red-200 bg-red-50/60 text-red-700 text-sm p-3">
          {err}
        </GlassCard>
      )}

      {/* GRID 2 CỘT: LEFT = CONTENT, RIGHT = META (THUMBNAIL + CATEGORIES + TAGS + STATUS) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
        {/* LEFT: TITLE / SLUG / EXCERPT + CONTENT */}
        <div className="space-y-4">
          {/* INFO CHÍNH */}
          <GlassCard className="p-5 space-y-4">
            <div className="space-y-2">
              <Label>Tiêu đề</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề bài viết"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ví dụ: huong-dan-ve-sinh-giay"
              />
            </div>

            <div className="space-y-2">
              <Label>Mô tả ngắn</Label>
              <Textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Tóm tắt ngắn sẽ hiển thị ở danh sách bài viết."
              />
            </div>
          </GlassCard>

          {/* EDITOR */}
          <GlassCard className="p-5 space-y-3">
            <Label className="font-medium">Nội dung chi tiết</Label>
            <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              <Editor value={content} onChange={setContent} />
            </div>
          </GlassCard>
        </div>

        {/* RIGHT: THUMBNAIL + CATEGORY + TAGS + STATUS */}
        <div className="space-y-4">
          {/* THUMBNAIL – Option A, bên phải */}
          <GlassCard className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Ảnh thumbnail</Label>
            </div>

            <SingleImageUploader
              value={thumbnailUrl}
              onChange={(url: string) => setThumbnailUrl(url)}
            />

            <p className="text-xs text-muted-foreground">
              Ảnh này sẽ dùng làm thumbnail cho danh sách blog và chia sẻ lên
              mạng xã hội.
            </p>
          </GlassCard>

          {/* CATEGORY – CHECKBOX LIST (đa danh mục) */}
          <GlassCard className="p-4 space-y-3">
            <Label className="font-medium">Danh mục</Label>

            {categories.length === 0 ? (
              <p className="text-xs text-red-500">
                Chưa có danh mục blog hoặc không tải được danh mục.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <label
                    key={c._id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={categoryIds.includes(c._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCategoryIds((prev) =>
                            prev.includes(c._id) ? prev : [...prev, c._id]
                          )
                        } else {
                          setCategoryIds((prev) =>
                            prev.filter((x) => x !== c._id)
                          )
                        }
                      }}
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Có thể chọn nhiều danh mục cho một bài viết.
            </p>
          </GlassCard>

          {/* TAGS – CHECKBOX LIST */}
          <GlassCard className="p-4 space-y-3">
            <Label className="font-medium">Tags</Label>

            {tags.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Chưa có tag nào. Hãy tạo trước ở phần Tags.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {tags.map((t) => (
                  <label
                    key={t._id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={tagIds.includes(t._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTagIds((prev) =>
                            prev.includes(t._id) ? prev : [...prev, t._id]
                          )
                        } else {
                          setTagIds((prev) => prev.filter((x) => x !== t._id))
                        }
                      }}
                    />
                    <span>{t.name}</span>
                  </label>
                ))}
              </div>
            )}
          </GlassCard>

          {/* STATUS */}
          <GlassCard className="p-4 space-y-2">
            <Label className="font-medium">Trạng thái</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as BlogStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              &quot;Nháp&quot; không hiển thị ra storefront cho đến khi bạn đổi
              sang &quot;Đã xuất bản&quot;.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

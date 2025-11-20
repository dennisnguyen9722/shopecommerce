'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import api from '@/src/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import GlassCard from '@/src/components/admin/GlassCard'
import Editor from '@/src/components/editor/Editor'

// Types
type BlogStatus = 'draft' | 'published'

type BlogCategory = {
  _id: string
  name: string
  isActive?: boolean
}

export default function BlogCreatePage() {
  const router = useRouter()

  // ----- FORM STATE -----
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')

  const [status, setStatus] = useState<BlogStatus>('draft')
  const [categoryId, setCategoryId] = useState<string>('none')

  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const [saving, setSaving] = useState(false)

  // ----- THUMBNAIL -----
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  // ----- CATEGORIES -----
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [catLoading, setCatLoading] = useState(false)

  const loadCategories = async () => {
    try {
      setCatLoading(true)
      const res = await api.get('/admin/blog/categories')
      const items: BlogCategory[] = res.data?.items || res.data || []
      setCategories(items)
    } catch (err: any) {
      console.error(err)
      toast.error('Không thể tải danh mục')
      setCategories([])
    } finally {
      setCatLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // ----- HELPERS -----
  const handleTitleChange = (value: string) => {
    setTitle(value)
    setSlug(
      value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    )
  }

  const addTag = () => {
    const v = tagInput.trim()
    if (!v) return
    if (tags.includes(v)) {
      setTagInput('')
      return
    }
    setTags((prev) => [...prev, v])
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  // ----- SUBMIT -----
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề')
      return
    }

    setSaving(true)
    try {
      let finalThumbnail = thumbnailUrl

      // Upload nếu có file mới
      if (thumbnailFile) {
        const form = new FormData()
        form.append('images', thumbnailFile)

        const up = await api.post('/admin/products/upload', form)
        finalThumbnail = up.data.images?.[0]?.url || finalThumbnail
      }

      await api.post('/admin/blog/posts', {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content,
        status,
        tags,
        thumbnailUrl: finalThumbnail,
        category: categoryId === 'none' ? undefined : categoryId
      })

      toast.success('Tạo bài viết thành công')
      router.push('/admin/blog/posts')
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Không thể tạo bài viết')
    } finally {
      setSaving(false)
    }
  }

  // ----- UI -----
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tạo bài viết mới
          </h1>
          <p className="text-sm text-muted-foreground">
            Viết nội dung blog / tin tức cho storefront.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push('/admin/blog/posts')}
          >
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu bài viết'}
          </Button>
        </div>
      </div>

      {/* GRID 2 CỘT */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <GlassCard className="space-y-4 p-5">
            <div className="space-y-2">
              <Label>Tiêu đề</Label>
              <Input
                placeholder="Ví dụ: Hướng dẫn vệ sinh giày sneaker đúng cách"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                placeholder="huong-dan-ve-sinh-giay-sneaker"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tóm tắt ngắn</Label>
              <Textarea
                rows={3}
                placeholder="Mô tả ngắn sẽ hiển thị ở danh sách bài viết."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </GlassCard>

          {/* CONTENT EDITOR */}
          <GlassCard className="p-5 space-y-3">
            <Label className="font-medium">Nội dung chi tiết</Label>

            <div className="border rounded-xl overflow-hidden bg-white">
              <Editor value={content} onChange={setContent} />
            </div>
          </GlassCard>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* THUMBNAIL */}
          <GlassCard className="p-4 space-y-3">
            <Label className="font-medium">Ảnh thumbnail</Label>

            <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  className="w-full h-full object-cover"
                  alt="thumbnail"
                />
              ) : (
                <p className="text-gray-500 text-sm">Chưa có ảnh</p>
              )}
            </div>

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null
                setThumbnailFile(f)
                if (f) setThumbnailUrl(URL.createObjectURL(f))
              }}
            />

            <p className="text-xs text-muted-foreground pt-1">
              Ảnh sẽ hiển thị ở danh sách blog và khi chia sẻ lên mạng xã hội.
            </p>
          </GlassCard>

          {/* CATEGORY */}
          <GlassCard className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Danh mục</Label>
              {catLoading && (
                <span className="text-xs text-muted-foreground">
                  Đang tải...
                </span>
              )}
            </div>

            <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có danh mục</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {categories.length === 0 && !catLoading && (
              <p className="text-xs text-red-500">
                Không thể tải danh mục hoặc chưa có danh mục blog.
              </p>
            )}
          </GlassCard>

          {/* TAGS */}
          <GlassCard className="p-4 space-y-3">
            <Label className="font-medium">Tags</Label>

            <div className="flex gap-2">
              <Input
                placeholder="Nhập tag rồi Enter / Thêm"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button variant="outline" type="button" onClick={addTag}>
                Thêm
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(t)}
                >
                  {t} ✕
                </Badge>
              ))}

              {tags.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  Chưa có tag nào.
                </span>
              )}
            </div>
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
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              Nháp sẽ không hiển thị ra storefront cho đến khi bạn đổi sang
              &quot;Đã xuất bản&quot;.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

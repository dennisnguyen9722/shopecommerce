'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

import api from '@/src/lib/api'

import GlassCard from '@/src/components/admin/GlassCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody
} from '@/components/ui/table'

type BlogPostStatus = 'draft' | 'published' | 'archived'

interface BlogPost {
  _id: string
  title: string
  slug: string
  status: BlogPostStatus
  createdAt: string
  updatedAt: string
}

export default function BlogPostsPage() {
  const router = useRouter()

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)

  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<'all' | BlogPostStatus>('all')

  async function loadPosts() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/blog/posts')
      setPosts(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const filtered = posts.filter((p) => {
    const key = keyword.toLowerCase()
    const matchKeyword =
      p.title.toLowerCase().includes(key) || p.slug.toLowerCase().includes(key)

    const matchStatus = status === 'all' ? true : p.status === status

    return matchKeyword && matchStatus
  })

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog / Tin tức</h1>

        <Button onClick={() => router.push('/admin/blog/posts/new')}>
          + Thêm bài viết
        </Button>
      </div>

      {/* FILTER BAR */}
      <GlassCard className="p-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm theo tiêu đề hoặc slug..."
          className="w-[260px]"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <Select
          value={status}
          onValueChange={(v) =>
            setStatus(v as 'all' | 'draft' | 'published' | 'archived')
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="draft">Nháp</SelectItem>
            <SelectItem value="published">Đã xuất bản</SelectItem>
            <SelectItem value="archived">Lưu trữ</SelectItem>
          </SelectContent>
        </Select>
      </GlassCard>

      {/* TABLE */}
      <GlassCard className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Tiêu đề</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Ngày cập nhật</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Không có bài viết nào
                </TableCell>
              </TableRow>
            )}

            {filtered.map((post) => (
              <TableRow
                key={post._id}
                className="cursor-pointer hover:bg-white/20 transition"
                onClick={() => router.push(`/admin/blog/posts/${post._id}`)}
              >
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="text-gray-600">{post.slug}</TableCell>
                <TableCell>
                  <StatusBadge status={post.status} />
                </TableCell>
                <TableCell>
                  {format(new Date(post.createdAt), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  {format(new Date(post.updatedAt), 'dd/MM/yyyy HH:mm')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  )
}

function StatusBadge({ status }: { status: BlogPostStatus }) {
  if (status === 'published')
    return <Badge className="bg-emerald-600">Đã xuất bản</Badge>

  if (status === 'archived')
    return (
      <Badge variant="outline" className="border-gray-400 text-gray-600">
        Đã lưu trữ
      </Badge>
    )

  return (
    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
      Nháp
    </Badge>
  )
}

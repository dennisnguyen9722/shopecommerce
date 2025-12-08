'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import api from '@/src/lib/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import GlassCard from '@/src/components/admin/GlassCard'
import ConfirmDeleteDialog from '@/src/components/admin/ConfirmDeleteDialog'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Types
interface Category {
  _id: string
  name: string
  slug: string
  isActive: boolean
  parent?: string | null
  // ⭐ icon field (optional)
  icon?: {
    url: string
    public_id: string
  } | null
}

interface ApiResponse {
  items: Category[]
  pagination: {
    page: number
    pages: number
    total: number
  }
}

export default function CategoriesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])

  const router = useRouter()

  // ======================
  // FETCH
  // ======================
  const { data, isLoading, isError, refetch } = useQuery<ApiResponse>({
    queryKey: ['admin-categories', search, status, sort, page],
    queryFn: async () => {
      const res = await api.get('/admin/categories', {
        params: {
          search,
          status,
          sort,
          page,
          limit: 10
        }
      })
      return res.data
    }
  })

  const items: Category[] = data?.items || []
  const pagination = data?.pagination || {
    page,
    pages: 1,
    total: items.length
  }

  // ======================
  // BULK
  // ======================
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selected.length === items.length) setSelected([])
    else setSelected(items.map((x) => x._id))
  }

  const bulkDelete = async () => {
    await api.post('/admin/categories/bulk-delete', { ids: selected })
    setSelected([])
    setPage(1)
    refetch()
  }

  // ======================
  // UI
  // ======================

  if (isLoading) return <div className="p-6">Đang tải danh mục...</div>
  if (isError) return <div className="p-6 text-red-600">Lỗi tải danh mục.</div>

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold dark:text-gray-900">
            Danh mục sản phẩm
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh mục dùng cho sản phẩm.
          </p>
        </div>

        <Button onClick={() => router.push('/admin/categories/new')}>
          <Plus className="w-4 h-4 mr-2" /> Tạo danh mục
        </Button>
      </div>

      {/* FILTER BAR — GLASS */}
      <GlassCard className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <Input
            placeholder="Tìm theo tên hoặc slug..."
            className="w-full md:w-64"
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
          />

          {/* Status */}
          <Select
            value={status}
            onValueChange={(v) => {
              setPage(1)
              setStatus(v)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hiển thị</SelectItem>
              <SelectItem value="inactive">Ẩn</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={sort}
            onValueChange={(v) => {
              setPage(1)
              setSort(v)
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
              <SelectItem value="name-asc">Tên A → Z</SelectItem>
              <SelectItem value="name-desc">Tên Z → A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* BULK BAR */}
      {selected.length > 0 && (
        <GlassCard className="p-3 flex items-center justify-between bg-purple-50/40">
          <div className="text-sm">
            Đã chọn <strong>{selected.length}</strong> danh mục
          </div>

          <ConfirmDeleteDialog
            trigger={
              <Button variant="destructive" size="sm">
                Xoá đã chọn
              </Button>
            }
            title={`Xoá ${selected.length} danh mục?`}
            description="Không thể hoàn tác thao tác này."
            onConfirm={bulkDelete}
          />
        </GlassCard>
      )}

      {/* TABLE — GLASS */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Danh sách danh mục</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={selected.length === items.length && items.length > 0}
                  onChange={selectAll}
                />
              </TableHead>

              <TableHead>Icon</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Danh mục cha</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((cat) => (
              <TableRow key={cat._id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(cat._id)}
                    onChange={() => toggleSelect(cat._id)}
                  />
                </TableCell>

                {/* ICON */}
                <TableCell>
                  {cat.icon?.url ? (
                    <img
                      src={cat.icon.url}
                      alt={`${cat.name} icon`}
                      className="w-10 h-10 object-contain rounded-md bg-white p-1 border"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center text-xs text-gray-400 bg-gray-100 rounded-md">
                      —
                    </div>
                  )}
                </TableCell>

                <TableCell className="font-medium">{cat.name}</TableCell>

                <TableCell className="text-muted-foreground">
                  {cat.slug}
                </TableCell>

                <TableCell>
                  {cat.isActive ? (
                    <Badge className="bg-green-100 text-green-700">
                      Hiển thị
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Ẩn</Badge>
                  )}
                </TableCell>

                <TableCell>
                  {cat.parent ? (
                    <span className="text-gray-700">
                      {items.find((x) => x._id === cat.parent)?.name || '—'}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <Link href={`/admin/categories/${cat._id}`}>
                    <Button variant="outline" size="sm">
                      Sửa
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>

      {/* PAGINATION */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <div>
          Trang {pagination.page} / {pagination.pages}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹ Trước
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau ›
          </Button>
        </div>
      </div>
    </div>
  )
}

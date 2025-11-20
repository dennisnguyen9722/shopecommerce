'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'

import api from '@/src/lib/api'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

import { Input } from '@/components/ui/input'
import GlassCard from '@/src/components/admin/GlassCard'

interface BlogCategory {
  _id: string
  name: string
  slug: string
  createdAt: string
}

export default function BlogCategoriesPage() {
  const [list, setList] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [page, setPage] = useState(1)
  const perPage = 10

  async function load() {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/blog/categories')
      setList(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Filter + sort + pagination
  const filtered = list
    .filter((c) => {
      const s = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(s) || c.slug.toLowerCase().includes(s)
      )
    })
    .sort((a, b) => {
      if (sort === 'asc') return a.name.localeCompare(b.name)
      return b.name.localeCompare(a.name)
    })

  const pages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  async function confirmDelete() {
    if (!deleteId) return

    try {
      setDeleting(true)
      await api.delete(`/admin/blog/categories/${deleteId}`)
      toast.success('Đã xoá danh mục!')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Không thể xoá danh mục')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Danh mục bài viết</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh mục blog.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/blog/categories/new">
            <Plus className="mr-2 h-4 w-4" /> Tạo danh mục
          </Link>
        </Button>
      </div>

      {/* FILTER BAR – GlassCard */}
      <GlassCard className="p-4 flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Tìm theo tên hoặc slug…"
          className="w-[260px]"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />

        <Button
          variant="outline"
          onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2"
        >
          <ArrowUpDown className="w-4 h-4" />
          Sắp xếp: {sort === 'asc' ? 'A → Z' : 'Z → A'}
        </Button>
      </GlassCard>

      {/* TABLE – GlassCard */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b bg-white/20 backdrop-blur-lg">
          <p className="text-sm text-muted-foreground">
            Tổng cộng {filtered.length} danh mục
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10 text-sm">
            Đang tải danh mục...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5">Tên</TableHead>
                <TableHead className="px-5">Slug</TableHead>
                <TableHead className="px-5">Ngày tạo</TableHead>
                <TableHead className="px-5 text-right" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.map((cat) => (
                <TableRow key={cat._id} className="[&_td]:px-5">
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {cat.slug}
                  </TableCell>
                  <TableCell>
                    {new Date(cat.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                          <Link href={`/admin/blog/categories/${cat._id}`}>
                            Chỉnh sửa
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(cat._id)}
                        >
                          Xoá
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Không có danh mục nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </GlassCard>

      {/* PAGINATION – GlassCard */}
      {pages > 1 && (
        <GlassCard className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Trang {page} / {pages}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              Sau
            </Button>
          </div>
        </GlassCard>
      )}

      {/* DELETE DIALOG */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá danh mục?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Đang xoá...' : 'Xoá'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

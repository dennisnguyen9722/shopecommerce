'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, MoreHorizontal } from 'lucide-react'
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
import GlassCard from '@/src/components/admin/GlassCard'

interface BlogTag {
  _id: string
  name: string
  slug: string
  createdAt: string
}

export default function BlogTagsPage() {
  const [list, setList] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(true)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    try {
      const { data } = await api.get('/admin/blog/tags')
      setList(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function confirmDelete() {
    if (!deleteId) return

    try {
      setDeleting(true)
      await api.delete(`/admin/blog/tags/${deleteId}`)
      toast.success('Đã xoá tag!')
      setDeleteId(null)
      load()
    } catch (e) {
      toast.error('Không thể xoá tag')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tags</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tag cho bài viết.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/blog/tags/new">
            <Plus className="mr-2 h-4 w-4" /> Tạo tag
          </Link>
        </Button>
      </div>

      {/* LIST CARD – GLASS */}
      <GlassCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-white/20 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Tổng cộng <span className="font-medium">{list.length}</span> tags
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8 text-sm text-muted-foreground">
            Đang tải...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="[&_th]:px-5 [&_th]:py-3">
                <TableHead>Tên</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {list.map((tag) => (
                <TableRow
                  key={tag._id}
                  className="[&_td]:px-5 [&_td]:py-4 hover:bg-white/10 transition-colors"
                >
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tag.slug}
                  </TableCell>
                  <TableCell>
                    {new Date(tag.createdAt).toLocaleDateString('vi-VN')}
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
                          <Link href={`/admin/blog/tags/${tag._id}`}>
                            Chỉnh sửa
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(tag._id)}
                        >
                          Xoá
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {list.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    Chưa có tag nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </GlassCard>

      {/* DELETE DIALOG */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá Tag?</AlertDialogTitle>
            <AlertDialogDescription>
              Tag sẽ bị xoá vĩnh viễn. Bài viết dùng tag này sẽ không bị xoá.
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

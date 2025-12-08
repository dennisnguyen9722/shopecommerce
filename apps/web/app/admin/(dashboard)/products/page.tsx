'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Plus,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import ConfirmDeleteDialog from '@/src/components/admin/ConfirmDeleteDialog'
import GlassCard from '@/src/components/admin/GlassCard'
import { toast } from 'sonner'

// ===============================================
// UTILS
// ===============================================
const formatCurrency = (n: number | undefined) => {
  if (typeof n !== 'number') return '-'
  return n.toLocaleString('vi-VN') + ' ₫'
}

const getDiscountPercent = (price: number, comparePrice: number) => {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

export default function ProductsPage() {
  const router = useRouter()

  // ===============================================
  // FILTER STATE
  // ===============================================
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [selected, setSelected] = useState<string[]>([])
  const pageSize = 10

  // ===============================================
  // FETCH PRODUCTS
  // ===============================================
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'admin-products',
      search,
      categoryFilter,
      stockFilter,
      sort,
      page
    ],
    queryFn: async () => {
      const res = await api.get('/admin/products', {
        params: {
          search,
          category: categoryFilter,
          stock: stockFilter,
          sort,
          page,
          limit: pageSize
        }
      })
      return res.data
    }
  })

  // ===============================================
  // FETCH CATEGORIES
  // ===============================================
  const { data: catData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/admin/categories')
      return res.data.items || []
    }
  })

  const categories = catData || []

  if (isLoading)
    return <div className="p-6">Đang tải danh sách sản phẩm...</div>
  if (isError)
    return <div className="p-6 text-red-600">Lỗi tải danh sách sản phẩm.</div>

  // ===============================================
  // SAFETY
  // ===============================================
  const items = data.items || []
  const pagination = data.pagination || { page, pages: 1, total: items.length }

  // ===============================================
  // BULK SELECT
  // ===============================================
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selected.length === items.length) setSelected([])
    else setSelected(items.map((x: any) => x._id))
  }

  const bulkDelete = async () => {
    try {
      await api.post('/admin/products/bulk-delete', { ids: selected })
      toast.success('Đã xoá sản phẩm đã chọn')
      setSelected([])
      setPage(1)
      refetch()
    } catch (e) {
      toast.error('Lỗi xoá sản phẩm')
    }
  }

  // ===============================================
  // ⭐ FEATURED TOGGLE
  // ===============================================
  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await api.patch(`/admin/products/${id}/featured`, {
        isFeatured: !current
      })
      toast.success('Cập nhật nổi bật thành công')
      refetch()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Lỗi cập nhật nổi bật')
    }
  }

  // ===============================================
  // ⭐ PUBLISH TOGGLE
  // ===============================================
  const togglePublish = async (id: string, current: boolean) => {
    try {
      await api.patch(`/admin/products/${id}/publish`, {
        isPublished: !current
      })
      toast.success('Cập nhật trạng thái công khai thành công')
      refetch()
    } catch (e: any) {
      toast.error('Lỗi cập nhật trạng thái')
    }
  }

  // ===============================================
  // UI
  // ===============================================
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-gray-900">Sản phẩm</h1>
        <Button onClick={() => router.push('/admin/products/new')}>
          <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
        </Button>
      </div>

      {/* FILTER BAR */}
      <GlassCard className="py-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <Input
            placeholder="Tìm theo tên hoặc slug..."
            className="w-full md:w-64"
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
          />

          {/* CATEGORY */}
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setPage(1)
              setCategoryFilter(v)
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* STOCK */}
          <Select
            value={stockFilter}
            onValueChange={(v) => {
              setPage(1)
              setStockFilter(v)
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tồn kho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="in-stock">Còn hàng</SelectItem>
              <SelectItem value="out-stock">Hết hàng</SelectItem>
            </SelectContent>
          </Select>

          {/* SORT */}
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
              <SelectItem value="price-asc">Giá thấp → cao</SelectItem>
              <SelectItem value="price-desc">Giá cao → thấp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* BULK DELETE BAR */}
      {selected.length > 0 && (
        <GlassCard className="border-red-200 bg-red-50/40 text-red-700 flex items-center justify-between p-3 rounded-xl">
          <div className="text-sm">
            Đã chọn <strong>{selected.length}</strong> sản phẩm
          </div>

          <ConfirmDeleteDialog
            trigger={<Button variant="destructive">Xoá đã chọn</Button>}
            title={`Xoá ${selected.length} sản phẩm?`}
            description="Hành động này không thể hoàn tác."
            onConfirm={bulkDelete}
          />
        </GlassCard>
      )}

      {/* TABLE */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold">Danh sách sản phẩm</h2>
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
              <TableHead>Ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Giảm</TableHead>
              <TableHead>Nổi bật</TableHead>
              <TableHead>Công khai</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((product: any) => {
              const discountPercent = getDiscountPercent(
                product.price,
                product.comparePrice
              )

              return (
                <TableRow key={product._id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(product._id)}
                      onChange={() => toggleSelect(product._id)}
                    />
                  </TableCell>

                  <TableCell>
                    {product.images?.[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="max-w-60">
                    <div className="font-medium line-clamp-2">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      /products/{product.slug}
                    </div>
                  </TableCell>

                  <TableCell>{product.category?.name || '—'}</TableCell>

                  <TableCell>
                    {product.comparePrice > product.price ? (
                      <div className="flex flex-col">
                        <span className="text-red-600 font-semibold">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-gray-400 line-through text-xs">
                          {formatCurrency(product.comparePrice)}
                        </span>
                      </div>
                    ) : (
                      <span>{formatCurrency(product.price)}</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {discountPercent > 0 ? (
                      <span className="text-red-600 font-semibold">
                        -{discountPercent}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>

                  {/* FEATURED */}
                  <TableCell>
                    <button
                      onClick={() =>
                        toggleFeatured(product._id, product.isFeatured)
                      }
                      className="flex items-center"
                    >
                      {product.isFeatured ? (
                        <ToggleRight className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </TableCell>

                  {/* PUBLISH */}
                  <TableCell>
                    <button
                      onClick={() =>
                        togglePublish(product._id, product.isPublished)
                      }
                      className="flex items-center"
                    >
                      {product.isPublished ? (
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </TableCell>

                  <TableCell>{product.stock}</TableCell>

                  <TableCell className="text-right">
                    <Link href={`/admin/products/${product._id}`}>
                      <Button variant="outline" size="sm">
                        Sửa
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}

            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6">
                  Không có sản phẩm nào khớp bộ lọc.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <div>
            Trang {pagination.page}/{pagination.pages} · Tổng {pagination.total}{' '}
            sản phẩm
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹ Trước
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            >
              Sau ›
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

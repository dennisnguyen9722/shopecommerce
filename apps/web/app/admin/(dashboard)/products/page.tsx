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
  ToggleLeft,
  ToggleRight,
  Pencil, // Thêm icon Pencil
  Trash2 // Thêm icon Trash nếu muốn dùng sau này
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip' // Thêm Tooltip cho xịn

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

  const items = data.items || []
  const pagination = data.pagination || { page, pages: 1, total: items.length }

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

  return (
    <div className="p-4 md:p-6 space-y-6 w-full max-w-[100vw] overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-gray-900">Sản phẩm</h1>
        <Button onClick={() => router.push('/admin/products/new')}>
          <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
        </Button>
      </div>

      {/* FILTER BAR */}
      <GlassCard className="p-4">
        <div className="flex flex-col xl:flex-row gap-4 justify-between">
          <Input
            placeholder="Tìm theo tên hoặc slug..."
            className="w-full xl:w-72"
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
          />

          <div className="flex flex-wrap gap-2 md:gap-4 items-center">
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setPage(1)
                setCategoryFilter(v)
              }}
            >
              <SelectTrigger className="w-full md:w-48">
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

            <Select
              value={stockFilter}
              onValueChange={(v) => {
                setPage(1)
                setStockFilter(v)
              }}
            >
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Tồn kho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="in-stock">Còn hàng</SelectItem>
                <SelectItem value="out-stock">Hết hàng</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(v) => {
                setPage(1)
                setSort(v)
              }}
            >
              <SelectTrigger className="w-full md:w-36">
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
        </div>
      </GlassCard>

      {/* BULK DELETE */}
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
      <GlassCard className="overflow-hidden p-0">
        <div className="w-full overflow-x-auto pb-2">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
              <TableRow>
                <TableHead className="w-[40px]">
                  <input
                    type="checkbox"
                    checked={
                      selected.length === items.length && items.length > 0
                    }
                    onChange={selectAll}
                  />
                </TableHead>
                <TableHead className="w-[80px]">Ảnh</TableHead>
                <TableHead className="w-[250px]">Tên</TableHead>
                <TableHead className="w-[120px]">Danh mục</TableHead>
                <TableHead className="w-[100px]">Giá</TableHead>
                <TableHead className="w-[80px]">Giảm</TableHead>
                <TableHead className="w-[80px]">Nổi bật</TableHead>
                <TableHead className="w-[80px]">Công khai</TableHead>
                <TableHead className="w-[80px]">Tồn kho</TableHead>

                {/* FIX: Bỏ background xám dính (sticky) để đồng bộ, hoặc làm transparent */}
                <TableHead className="w-[60px] text-right sticky right-0 z-10">
                  {/* Bỏ chữ "Thao tác" đi cho gọn, hoặc dùng icon settings */}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((product: any) => {
                const discountPercent = getDiscountPercent(
                  product.price,
                  product.comparePrice
                )

                return (
                  <TableRow key={product._id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.includes(product._id)}
                        onChange={() => toggleSelect(product._id)}
                      />
                    </TableCell>

                    <TableCell>
                      {product.images?.[0]?.url ? (
                        <div className="relative w-[50px] h-[50px] rounded-md overflow-hidden border bg-gray-100">
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="50px"
                          />
                        </div>
                      ) : (
                        <div className="w-[50px] h-[50px] bg-gray-100 rounded-md flex items-center justify-center text-[10px] text-gray-400">
                          No img
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col max-w-[220px]">
                        <div
                          className="font-medium text-sm line-clamp-2"
                          title={product.name}
                        >
                          {product.name}
                        </div>
                        <div
                          className="text-[10px] text-gray-400 truncate mt-0.5"
                          title={`/products/${product.slug}`}
                        >
                          /products/{product.slug}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell
                      className="max-w-[120px] truncate"
                      title={product.category?.name}
                    >
                      {product.category?.name || '—'}
                    </TableCell>

                    <TableCell>
                      {product.comparePrice > product.price ? (
                        <div className="flex flex-col">
                          <span className="text-red-600 font-semibold text-sm">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-gray-400 line-through text-[10px]">
                            {formatCurrency(product.comparePrice)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {discountPercent > 0 ? (
                        <span className="text-red-600 font-semibold text-xs">
                          -{discountPercent}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </TableCell>

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

                    <TableCell className="text-sm">{product.stock}</TableCell>

                    {/* FIX: Cột Thao tác đẹp hơn */}
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/admin/products/${product._id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil size={16} />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Chỉnh sửa</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                )
              })}

              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Không có sản phẩm nào khớp bộ lọc.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center p-4 border-t">
          <div className="text-xs text-muted-foreground">
            Trang {pagination.page}/{pagination.pages} · Tổng {pagination.total}{' '}
            SP
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
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau ›
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

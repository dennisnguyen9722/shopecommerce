'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'
import Link from 'next/link'
import Image from 'next/image'

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Package } from 'lucide-react'

import BulkAdjustStockModal from '@/src/components/admin/BulkAdjustStockModal'
import GlassCard from '@/src/components/admin/GlassCard'

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [bulkModal, setBulkModal] = useState(false)

  const { data, refetch } = useQuery({
    queryKey: ['inventory-list'],
    queryFn: async () => {
      const res = await api.get('/admin/inventory/list')
      return res.data
    }
  })

  const items = data?.items || []

  // filter
  const filtered = items.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* ------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Tồn kho
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý và theo dõi tồn kho sản phẩm
          </p>
        </div>

        <Link href="/admin/inventory/logs">
          <Button
            variant="outline"
            className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
          >
            Xem lịch sử tồn kho
          </Button>
        </Link>
      </div>

      {/* ------------------------------------------------ */}
      {/* FILTER BAR */}
      {/* ------------------------------------------------ */}
      <GlassCard className="py-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <div className="text-sm text-gray-500">
            Tìm thấy <strong>{filtered.length}</strong> sản phẩm
          </div>
        </div>
      </GlassCard>

      {/* ------------------------------------------------ */}
      {/* BULK BAR */}
      {/* ------------------------------------------------ */}
      {selected.length > 0 && (
        <GlassCard className="border-blue-200 bg-blue-50/40 dark:bg-blue-950/30">
          <div className="flex items-center justify-between p-3">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Đã chọn <strong>{selected.length}</strong> sản phẩm
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setBulkModal(true)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700"
              >
                Điều chỉnh hàng loạt
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  if (!confirm(`Xoá ${selected.length} sản phẩm?`)) return
                  // Handle delete
                }}
              >
                Xoá
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ------------------------------------------------ */}
      {/* INVENTORY TABLE */}
      {/* ------------------------------------------------ */}
      <GlassCard>
        <div className="border-b border-white/20 pb-4 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            Danh sách tồn kho
          </h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={
                    selected.length === filtered.length && filtered.length > 0
                  }
                  onCheckedChange={(checked) =>
                    setSelected(checked ? filtered.map((p: any) => p._id) : [])
                  }
                />
              </TableHead>
              <TableHead>Ảnh</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((p: any) => (
              <TableRow key={p._id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(p._id)}
                    onCheckedChange={() =>
                      setSelected((s) =>
                        s.includes(p._id)
                          ? s.filter((x) => x !== p._id)
                          : [...s, p._id]
                      )
                    }
                  />
                </TableCell>

                <TableCell>
                  {p.images?.[0]?.url ? (
                    <Image
                      src={p.images[0].url}
                      alt=""
                      width={48}
                      height={48}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-[48px] h-[48px] bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    /{p.slug}
                  </div>
                </TableCell>

                <TableCell>{p.category?.name || '—'}</TableCell>

                <TableCell>
                  <span
                    className={`font-semibold ${
                      p.stock === 0
                        ? 'text-red-600 dark:text-red-400'
                        : p.stock < 10
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {p.stock}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <Link href={`/admin/products/${p._id}`}>
                    <Button size="sm" variant="outline">
                      Sửa
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  Không tìm thấy sản phẩm nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </GlassCard>

      {/* ------------------------------------------------ */}
      {/* BULK MODAL */}
      {/* ------------------------------------------------ */}
      <BulkAdjustStockModal
        open={bulkModal}
        setOpen={setBulkModal}
        productIds={selected}
        onSuccess={() => {
          setSelected([])
          refetch()
        }}
      />
    </div>
  )
}

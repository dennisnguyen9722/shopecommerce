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
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import BulkAdjustStockModal from '@/src/components/admin/BulkAdjustStockModal'

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
        <h1 className="text-2xl font-bold tracking-tight">Tồn kho</h1>

        <Link href="/admin/inventory/logs">
          <Button variant="outline">Xem lịch sử tồn kho</Button>
        </Link>
      </div>

      {/* ------------------------------------------------ */}
      {/* FILTER BAR */}
      {/* ------------------------------------------------ */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <Input
            placeholder="Tìm sản phẩm…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </CardContent>
      </Card>

      {/* ------------------------------------------------ */}
      {/* BULK BAR */}
      {/* ------------------------------------------------ */}
      {selected.length > 0 && (
        <Card className="border border-blue-300 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="text-sm">
              <strong>{selected.length}</strong> sản phẩm đã chọn
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setBulkModal(true)}>
                Điều chỉnh hàng loạt
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  if (!confirm(`Xoá ${selected.length} sản phẩm?`)) return
                }}
              >
                Xoá
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------ */}
      {/* INVENTORY TABLE */}
      {/* ------------------------------------------------ */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={selected.length === filtered.length}
                    onCheckedChange={(checked) =>
                      setSelected(
                        checked ? filtered.map((p: any) => p._id) : []
                      )
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
                        className="rounded-md"
                      />
                    ) : (
                      <div className="w-[48px] h-[48px] bg-gray-100 rounded-md" />
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">/{p.slug}</div>
                  </TableCell>

                  <TableCell>{p.category?.name || '—'}</TableCell>

                  <TableCell className="font-semibold">{p.stock}</TableCell>

                  <TableCell className="text-right">
                    <Link href={`/admin/products/${p._id}`}>
                      <Button size="sm" variant="outline">
                        Sửa
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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

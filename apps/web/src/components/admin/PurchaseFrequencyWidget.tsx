'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/src/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export default function PurchaseFrequencyWidget() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  const fetchData = async () => {
    try {
      const { data } = await api.get('/admin/analytics/purchase-frequency')
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    const timer = setInterval(fetchData, 10000)

    return () => clearInterval(timer)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Tần suất mua hàng
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có dữ liệu</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">ID Khách hàng</TableHead>
                  <TableHead className="font-semibold text-right">
                    Số đơn hàng
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row: any) => (
                  <TableRow key={row._id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/customers/${row._id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {row._id}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                        {row.ordersCount}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

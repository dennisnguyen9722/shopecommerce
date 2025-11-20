'use client'

import { useEffect, useState } from 'react'
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

export default function BestSellingProductsWidget() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  const fetchData = async () => {
    try {
      const { data } = await api.get('/admin/analytics/best-products', {
        params: { limit: 5, days: 30 }
      })
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
        <CardTitle>Sản phẩm bán chạy (30 ngày)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Đã bán</TableHead>
                <TableHead>Doanh thu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p: any) => (
                <TableRow key={p.productId}>
                  <TableCell className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                    />
                    {p.name}
                  </TableCell>
                  <TableCell>{p.quantitySold}</TableCell>
                  <TableCell>{p.revenue.toLocaleString()}₫</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

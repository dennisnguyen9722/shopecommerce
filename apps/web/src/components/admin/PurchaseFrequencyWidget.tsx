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
        <CardTitle>Tần suất mua hàng</CardTitle>
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
                <TableHead>ID Khách</TableHead>
                <TableHead>Số đơn hàng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row: any) => (
                <TableRow key={row._id}>
                  <TableCell>{row._id}</TableCell>
                  <TableCell>{row.ordersCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

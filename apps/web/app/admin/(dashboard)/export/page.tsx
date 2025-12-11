'use client'

import { useState } from 'react'
import {
  Download,
  FileSpreadsheet,
  Users,
  Package,
  ShoppingCart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import serverApi from '@/src/lib/serverApi'
import { toast } from 'sonner'

export default function ExportPage() {
  const [loading, setLoading] = useState<string | null>(null)

  // Filters
  const [orderFilters, setOrderFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    format: 'excel'
  })

  const [productFilters, setProductFilters] = useState({
    category: '',
    inStock: 'all'
  })

  const [customerFilters, setCustomerFilters] = useState({
    hasOrders: 'all',
    minSpent: ''
  })

  // Export Orders
  const handleExportOrders = async () => {
    setLoading('orders')
    try {
      const params = new URLSearchParams()
      if (orderFilters.startDate)
        params.append('startDate', orderFilters.startDate)
      if (orderFilters.endDate) params.append('endDate', orderFilters.endDate)
      if (orderFilters.status && orderFilters.status !== 'all')
        params.append('status', orderFilters.status)
      params.append('format', orderFilters.format)

      const response = await serverApi.get(
        `/admin/export/orders?${params.toString()}`,
        {
          responseType: 'blob'
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `orders-${Date.now()}.${orderFilters.format === 'csv' ? 'csv' : 'xlsx'}`
      )
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Export đơn hàng thành công!')
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi export đơn hàng')
    } finally {
      setLoading(null)
    }
  }

  // Export Products
  const handleExportProducts = async () => {
    setLoading('products')
    try {
      const params = new URLSearchParams()
      if (productFilters.category)
        params.append('category', productFilters.category)
      if (productFilters.inStock && productFilters.inStock !== 'all')
        params.append('inStock', productFilters.inStock)

      const response = await serverApi.get(
        `/admin/export/products?${params.toString()}`,
        {
          responseType: 'blob'
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `products-${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Export sản phẩm thành công!')
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi export sản phẩm')
    } finally {
      setLoading(null)
    }
  }

  // Export Customers
  const handleExportCustomers = async () => {
    setLoading('customers')
    try {
      const params = new URLSearchParams()
      if (customerFilters.hasOrders && customerFilters.hasOrders !== 'all')
        params.append('hasOrders', customerFilters.hasOrders)
      if (customerFilters.minSpent)
        params.append('minSpent', customerFilters.minSpent)

      const response = await serverApi.get(
        `/admin/export/customers?${params.toString()}`,
        {
          responseType: 'blob'
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `customers-${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Export khách hàng thành công!')
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi export khách hàng')
    } finally {
      setLoading(null)
    }
  }

  // Export All Data
  const handleExportAll = async () => {
    setLoading('all')
    try {
      const response = await serverApi.get('/admin/export/all', {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `all-data-${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Export tất cả dữ liệu thành công!')
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error('Lỗi khi export dữ liệu')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Xuất dữ liệu</h1>
        <p className="text-gray-500 mt-2">Xuất dữ liệu sang Excel hoặc CSV</p>
      </div>

      {/* Export All Card */}
      <Card className="p-6 bg-linear-to-r from-orange-500 to-red-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Xuất tất cả dữ liệu</h3>
            <p className="text-orange-50">
              Xuất toàn bộ đơn hàng, sản phẩm và khách hàng vào 1 file Excel
            </p>
          </div>
          <Button
            onClick={handleExportAll}
            disabled={loading === 'all'}
            className="bg-white text-orange-600 hover:bg-orange-50"
          >
            {loading === 'all' ? (
              'Đang xuất...'
            ) : (
              <>
                <Download size={16} className="mr-2" />
                Xuất tất cả
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Export Orders */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Đơn hàng</h3>
              <p className="text-sm text-gray-500">Xuất danh sách đơn hàng</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-600">Từ ngày</Label>
              <Input
                type="date"
                value={orderFilters.startDate}
                onChange={(e) =>
                  setOrderFilters({
                    ...orderFilters,
                    startDate: e.target.value
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-600">Đến ngày</Label>
              <Input
                type="date"
                value={orderFilters.endDate}
                onChange={(e) =>
                  setOrderFilters({ ...orderFilters, endDate: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-600">Trạng thái</Label>
              <Select
                value={orderFilters.status}
                onValueChange={(val) =>
                  setOrderFilters({ ...orderFilters, status: val })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="shipped">Đang giao</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-600">Định dạng</Label>
              <Select
                value={orderFilters.format}
                onValueChange={(val) =>
                  setOrderFilters({ ...orderFilters, format: val })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExportOrders}
              disabled={loading === 'orders'}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading === 'orders' ? (
                'Đang xuất...'
              ) : (
                <>
                  <FileSpreadsheet size={16} className="mr-2" />
                  Xuất đơn hàng
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Export Products */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Sản phẩm</h3>
              <p className="text-sm text-gray-500">Xuất danh sách sản phẩm</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-600">Tồn kho</Label>
              <Select
                value={productFilters.inStock}
                onValueChange={(val) =>
                  setProductFilters({ ...productFilters, inStock: val })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Còn hàng</SelectItem>
                  <SelectItem value="false">Hết hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExportProducts}
              disabled={loading === 'products'}
              className="w-full bg-green-600 hover:bg-green-700 mt-auto"
            >
              {loading === 'products' ? (
                'Đang xuất...'
              ) : (
                <>
                  <FileSpreadsheet size={16} className="mr-2" />
                  Xuất sản phẩm
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Export Customers */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Khách hàng</h3>
              <p className="text-sm text-gray-500">Xuất danh sách khách hàng</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-600">Có đơn hàng</Label>
              <Select
                value={customerFilters.hasOrders}
                onValueChange={(val) =>
                  setCustomerFilters({ ...customerFilters, hasOrders: val })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Có đơn hàng</SelectItem>
                  <SelectItem value="false">Chưa có</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-600">
                Chi tiêu tối thiểu (₫)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={customerFilters.minSpent}
                onChange={(e) =>
                  setCustomerFilters({
                    ...customerFilters,
                    minSpent: e.target.value
                  })
                }
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleExportCustomers}
              disabled={loading === 'customers'}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading === 'customers' ? (
                'Đang xuất...'
              ) : (
                <>
                  <FileSpreadsheet size={16} className="mr-2" />
                  Xuất khách hàng
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>Lưu ý:</strong> File Excel có thể mở bằng Microsoft Excel,
          Google Sheets, hoặc LibreOffice. File CSV phù hợp để import vào các hệ
          thống khác.
        </p>
      </Card>
    </div>
  )
}

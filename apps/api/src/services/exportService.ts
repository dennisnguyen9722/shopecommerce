// src/services/exportService.ts
import ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export const exportService = {
  // 1. Export Orders to Excel
  async exportOrdersToExcel(orders: any[]) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Đơn hàng')

    // Style cho header
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb: 'FFEA580C' }
      },
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const },
      border: {
        top: { style: 'thin' as const },
        left: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        right: { style: 'thin' as const }
      }
    }

    // Định nghĩa columns
    worksheet.columns = [
      { header: 'Mã đơn hàng', key: 'orderId', width: 15 },
      { header: 'Khách hàng', key: 'customerName', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'phone', width: 15 },
      { header: 'Tổng tiền (₫)', key: 'totalPrice', width: 18 },
      { header: 'Phí ship (₫)', key: 'shippingFee', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'PT Thanh toán', key: 'paymentMethod', width: 20 },
      { header: 'Ngày đặt', key: 'orderDate', width: 20 },
      { header: 'Địa chỉ', key: 'shippingAddress', width: 50 }
    ]

    // Apply style cho header
    worksheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle
    })
    worksheet.getRow(1).height = 25

    // Thêm data
    orders.forEach((order) => {
      const row = worksheet.addRow({
        orderId:
          order.orderNumber || order._id.toString().slice(-8).toUpperCase(),
        customerName: order.customerName || 'N/A',
        email: order.customerEmail || 'N/A',
        phone: order.customerPhone || 'N/A',
        totalPrice: order.totalPrice,
        shippingFee: order.shippingFee || 0,
        status: this.getStatusText(order.status),
        paymentMethod: order.paymentMethod || 'COD',
        orderDate: format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', {
          locale: vi
        }),
        shippingAddress: order.customerAddress || 'N/A'
      })

      // Format số tiền
      row.getCell('totalPrice').numFmt = '#,##0'
      row.getCell('shippingFee').numFmt = '#,##0'

      // Căn giữa
      row.getCell('status').alignment = { horizontal: 'center' }
      row.getCell('paymentMethod').alignment = { horizontal: 'center' }
    })

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column.header) {
        column.width = Math.max(column.width || 10, column.header.length + 5)
      }
    })

    // Generate buffer
    return await workbook.xlsx.writeBuffer()
  },

  // 2. Export Products to Excel
  async exportProductsToExcel(products: any[]) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sản phẩm')

    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb: 'FFEA580C' }
      },
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const },
      border: {
        top: { style: 'thin' as const },
        left: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        right: { style: 'thin' as const }
      }
    }

    worksheet.columns = [
      { header: 'Mã SP', key: 'sku', width: 15 },
      { header: 'Tên sản phẩm', key: 'name', width: 40 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Giá bán (₫)', key: 'price', width: 15 },
      { header: 'Giá gốc (₫)', key: 'originalPrice', width: 15 },
      { header: 'Tồn kho', key: 'stock', width: 12 },
      { header: 'Đã bán', key: 'sold', width: 12 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Đánh giá', key: 'rating', width: 12 },
      { header: 'Ngày tạo', key: 'createdAt', width: 20 }
    ]

    worksheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle
    })
    worksheet.getRow(1).height = 25

    products.forEach((product) => {
      const row = worksheet.addRow({
        sku: product.sku || 'N/A',
        name: product.name,
        category: product.category?.name || 'N/A',
        price: product.price,
        originalPrice: product.comparePrice || product.price,
        stock: product.stock,
        sold: product.actualSold || product.sold || 0,
        status: product.isPublished ? 'Đang bán' : 'Ngừng bán',
        rating: product.averageRating
          ? `${product.averageRating.toFixed(1)} ⭐`
          : 'Chưa có',
        createdAt: format(new Date(product.createdAt), 'dd/MM/yyyy', {
          locale: vi
        })
      })

      row.getCell('price').numFmt = '#,##0'
      row.getCell('originalPrice').numFmt = '#,##0'
      row.getCell('stock').alignment = { horizontal: 'center' }
      row.getCell('sold').alignment = { horizontal: 'center' }
      row.getCell('status').alignment = { horizontal: 'center' }
      row.getCell('rating').alignment = { horizontal: 'center' }

      // Highlight low stock
      if (product.stock < 10) {
        row.getCell('stock').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEE2E2' }
        }
        row.getCell('stock').font = { color: { argb: 'FF991B1B' }, bold: true }
      }
    })

    return await workbook.xlsx.writeBuffer()
  },

  // 3. Export Customers to Excel
  async exportCustomersToExcel(customers: any[]) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Khách hàng')

    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb: 'FFEA580C' }
      },
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const },
      border: {
        top: { style: 'thin' as const },
        left: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        right: { style: 'thin' as const }
      }
    }

    worksheet.columns = [
      { header: 'Mã KH', key: 'customerId', width: 15 },
      { header: 'Họ tên', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'phone', width: 15 },
      { header: 'Điểm tích lũy', key: 'points', width: 15 },
      { header: 'Tổng chi tiêu (₫)', key: 'totalSpent', width: 18 },
      { header: 'Số đơn hàng', key: 'orderCount', width: 15 },
      { header: 'Ngày đăng ký', key: 'createdAt', width: 20 }
    ]

    worksheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle
    })
    worksheet.getRow(1).height = 25

    customers.forEach((customer) => {
      const row = worksheet.addRow({
        customerId: customer._id.toString().slice(-8).toUpperCase(),
        name: customer.name,
        email: customer.email,
        phone: customer.phone || 'N/A',
        points: customer.loyaltyPoints || 0,
        totalSpent: customer.totalSpent || 0,
        orderCount: customer.ordersCount || 0,
        createdAt: format(new Date(customer.createdAt), 'dd/MM/yyyy', {
          locale: vi
        })
      })

      row.getCell('totalSpent').numFmt = '#,##0'
      row.getCell('points').alignment = { horizontal: 'center' }
      row.getCell('orderCount').alignment = { horizontal: 'center' }
    })

    return await workbook.xlsx.writeBuffer()
  },

  // 4. Export Orders to CSV (lightweight alternative)
  async exportOrdersToCSV(orders: any[]) {
    const headers = [
      'Mã đơn hàng',
      'Khách hàng',
      'Email',
      'Số điện thoại',
      'Tổng tiền',
      'Trạng thái',
      'Ngày đặt',
      'Địa chỉ'
    ]

    const rows = orders.map((order) => [
      order.orderNumber || order._id.toString().slice(-8).toUpperCase(),
      order.customerName || 'N/A',
      order.customerEmail || 'N/A',
      order.customerPhone || 'N/A',
      order.totalPrice,
      this.getStatusText(order.status),
      format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }),
      order.customerAddress || 'N/A'
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    return Buffer.from('\uFEFF' + csv, 'utf-8') // Add BOM for Excel UTF-8 support
  },

  // 5. 🆕 Export ALL data to single Excel file with multiple sheets
  async exportAllToExcel(orders: any[], products: any[], customers: any[]) {
    const workbook = new ExcelJS.Workbook()

    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb: 'FFEA580C' }
      },
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const },
      border: {
        top: { style: 'thin' as const },
        left: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        right: { style: 'thin' as const }
      }
    }

    // ========== SHEET 1: ORDERS ==========
    const ordersSheet = workbook.addWorksheet('Đơn hàng')
    ordersSheet.columns = [
      { header: 'Mã đơn hàng', key: 'orderId', width: 15 },
      { header: 'Khách hàng', key: 'customerName', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Tổng tiền (₫)', key: 'totalPrice', width: 18 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Ngày đặt', key: 'orderDate', width: 20 }
    ]

    ordersSheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle
    })
    ordersSheet.getRow(1).height = 25

    orders.forEach((order) => {
      const row = ordersSheet.addRow({
        orderId:
          order.orderNumber || order._id.toString().slice(-8).toUpperCase(),
        customerName: order.customerName || 'N/A',
        email: order.customerEmail || 'N/A',
        totalPrice: order.totalPrice,
        status: this.getStatusText(order.status),
        orderDate: format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', {
          locale: vi
        })
      })
      row.getCell('totalPrice').numFmt = '#,##0'
      row.getCell('status').alignment = { horizontal: 'center' }
    })

    // ========== SHEET 2: PRODUCTS ==========
    const productsSheet = workbook.addWorksheet('Sản phẩm')
    productsSheet.columns = [
      { header: 'Mã SP', key: 'sku', width: 15 },
      { header: 'Tên sản phẩm', key: 'name', width: 40 },
      { header: 'Giá bán (₫)', key: 'price', width: 15 },
      { header: 'Tồn kho', key: 'stock', width: 12 },
      { header: 'Đã bán', key: 'sold', width: 12 },
      { header: 'Trạng thái', key: 'status', width: 15 }
    ]

    productsSheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle
    })
    productsSheet.getRow(1).height = 25

    products.forEach((product) => {
      const row = productsSheet.addRow({
        sku: product.sku || 'N/A',
        name: product.name,
        price: product.price,
        stock: product.stock,
        sold: product.actualSold || product.sold || 0,
        status: product.isPublished ? 'Đang bán' : 'Ngừng bán'
      })
      row.getCell('price').numFmt = '#,##0'
      row.getCell('stock').alignment = { horizontal: 'center' }
      row.getCell('sold').alignment = { horizontal: 'center' }
      row.getCell('status').alignment = { horizontal: 'center' }
    })

    // ========== SHEET 3: CUSTOMERS ==========
    const customersSheet = workbook.addWorksheet('Khách hàng')
    customersSheet.columns = [
      { header: 'Mã KH', key: 'customerId', width: 15 },
      { header: 'Họ tên', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'phone', width: 15 },
      { header: 'Tổng chi tiêu (₫)', key: 'totalSpent', width: 18 },
      { header: 'Số đơn hàng', key: 'orderCount', width: 15 }
    ]

    customersSheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle
    })
    customersSheet.getRow(1).height = 25

    customers.forEach((customer) => {
      const row = customersSheet.addRow({
        customerId: customer._id.toString().slice(-8).toUpperCase(),
        name: customer.name,
        email: customer.email,
        phone: customer.phone || 'N/A',
        totalSpent: customer.totalSpent || 0,
        orderCount: customer.ordersCount || 0
      })
      row.getCell('totalSpent').numFmt = '#,##0'
      row.getCell('orderCount').alignment = { horizontal: 'center' }
    })

    return await workbook.xlsx.writeBuffer()
  },

  // Helper: Get status text in Vietnamese
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đang giao',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    }
    return statusMap[status] || status
  }
}

export default exportService

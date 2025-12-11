// src/routes/admin/export.ts
import { Router } from 'express'
import Order from '../../models/Order'
import Product from '../../models/Product'
import Customer from '../../models/Customer'
import exportService from '../../services/exportService'

const router = Router()

// 1. Export Orders
router.get('/orders', async (req, res) => {
  try {
    const { format = 'excel', startDate, endDate, status } = req.query

    // Build query
    const query: any = {}

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate as string)
      if (endDate) query.createdAt.$lte = new Date(endDate as string)
    }

    if (status) {
      query.status = status
    }

    // Fetch orders with populated data
    const orders = await Order.find(query).sort({ createdAt: -1 })

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: 'Không có đơn hàng nào để export' })
    }

    // Generate file based on format
    let buffer: any
    let filename: string
    let contentType: string

    if (format === 'csv') {
      buffer = await exportService.exportOrdersToCSV(orders)
      filename = `orders-${Date.now()}.csv`
      contentType = 'text/csv'
    } else {
      buffer = await exportService.exportOrdersToExcel(orders)
      filename = `orders-${Date.now()}.xlsx`
      contentType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }

    // Set headers and send file
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Type', contentType)
    res.send(buffer)
  } catch (error) {
    console.error('Error exporting orders:', error)
    res.status(500).json({ message: 'Lỗi khi export đơn hàng' })
  }
})

// 2. Export Products
router.get('/products', async (req, res) => {
  try {
    const { category, inStock } = req.query

    const query: any = {}

    if (category) {
      query.category = category
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 }
    } else if (inStock === 'false') {
      query.stock = { $lte: 0 }
    }

    const [products, productSales] = await Promise.all([
      Product.find(query).populate('category', 'name').sort({ createdAt: -1 }),
      Order.aggregate([
        { $match: { status: { $in: ['completed', 'shipped'] } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' }
          }
        }
      ])
    ])

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: 'Không có sản phẩm nào để export' })
    }

    // ✅ FIX: Filter null _id
    const salesMap = new Map(
      productSales
        .filter((item: any) => item._id != null) // 🔥 Thêm dòng này
        .map((item: any) => [item._id.toString(), item.totalSold])
    )

    const productsWithSales = products.map((product) => {
      const productObj = product.toObject()
      productObj.actualSold = salesMap.get(product._id.toString()) || 0
      return productObj
    })

    const buffer = await exportService.exportProductsToExcel(productsWithSales)
    const filename = `products-${Date.now()}.xlsx`

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.send(buffer)
  } catch (error) {
    console.error('Error exporting products:', error)
    res.status(500).json({ message: 'Lỗi khi export sản phẩm' })
  }
})

// 3. Export Customers
router.get('/customers', async (req, res) => {
  try {
    const { hasOrders, minSpent } = req.query

    const query: any = {}

    if (hasOrders === 'true') {
      query.orderCount = { $gt: 0 }
    }

    if (minSpent) {
      query.totalSpent = { $gte: Number(minSpent) }
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 })

    if (customers.length === 0) {
      return res
        .status(404)
        .json({ message: 'Không có khách hàng nào để export' })
    }

    const buffer = await exportService.exportCustomersToExcel(customers)
    const filename = `customers-${Date.now()}.xlsx`

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.send(buffer)
  } catch (error) {
    console.error('Error exporting customers:', error)
    res.status(500).json({ message: 'Lỗi khi export khách hàng' })
  }
})

// 4. Export All Data (Combined) - ✅ FIXED
router.get('/all', async (req, res) => {
  try {
    console.log('📦 Starting export all data...')

    const [orders, products, customers, productSales] = await Promise.all([
      Order.find().sort({ createdAt: -1 }),
      Product.find().populate('category', 'name').sort({ createdAt: -1 }),
      Customer.find().sort({ createdAt: -1 }),
      Order.aggregate([
        { $match: { status: { $in: ['completed', 'shipped'] } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' }
          }
        }
      ])
    ])

    console.log('✅ Data fetched:', {
      orders: orders.length,
      products: products.length,
      customers: customers.length,
      productSales: productSales.length
    })

    // ✅ FIX: Filter out null _id before mapping
    const salesMap = new Map(
      productSales
        .filter((item: any) => item._id != null) // 🔥 Thêm dòng này
        .map((item: any) => [item._id.toString(), item.totalSold])
    )

    // Add sold data to each product
    const productsWithSales = products.map((product) => {
      const productObj = product.toObject()
      productObj.actualSold = salesMap.get(product._id.toString()) || 0
      return productObj
    })

    console.log('📊 Generating Excel file...')

    // Use the new combined export service
    const buffer = await exportService.exportAllToExcel(
      orders,
      productsWithSales,
      customers
    )

    const filename = `all-data-${Date.now()}.xlsx`

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.send(buffer)

    console.log('✅ Export all data successful')
  } catch (error) {
    console.error('❌ Error exporting all data:', error)
    res.status(500).json({
      message: 'Lỗi khi export tất cả dữ liệu',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router

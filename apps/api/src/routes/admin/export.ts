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

    if (status && status !== 'all') {
      query.status = status
    }

    // Fetch orders with populated data
    const orders = await Order.find(query).sort({ createdAt: -1 })

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: 'Không có đơn hàng nào để export' })
    }

    // 🆕 Build dynamic title & filename
    let titleParts: string[] = ['Đơn hàng']
    let filenameParts: string[] = ['orders']

    if (startDate && endDate) {
      const start = new Date(startDate as string).toLocaleDateString('vi-VN')
      const end = new Date(endDate as string).toLocaleDateString('vi-VN')
      titleParts.push(`từ ${start} đến ${end}`)
      filenameParts.push(`${startDate}-${endDate}`)
    } else if (startDate) {
      const start = new Date(startDate as string).toLocaleDateString('vi-VN')
      titleParts.push(`từ ${start}`)
      filenameParts.push(`from-${startDate}`)
    } else if (endDate) {
      const end = new Date(endDate as string).toLocaleDateString('vi-VN')
      titleParts.push(`đến ${end}`)
      filenameParts.push(`to-${endDate}`)
    }

    if (status && status !== 'all') {
      const statusMap: any = {
        pending: 'Chờ xử lý',
        processing: 'Đang xử lý',
        shipped: 'Đang giao',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
      }
      titleParts.push(`- ${statusMap[status as string] || status}`)
      filenameParts.push(status as string)
    }

    const title = titleParts.join(' ')
    const filenameBase = filenameParts.join('_')

    // Generate file based on format
    let buffer: any
    let filename: string
    let contentType: string

    if (format === 'csv') {
      buffer = await exportService.exportOrdersToCSV(orders, title)
      filename = `${filenameBase}.csv`
      contentType = 'text/csv'
    } else {
      buffer = await exportService.exportOrdersToExcel(orders, title)
      filename = `${filenameBase}.xlsx`
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
        { $match: { status: { $in: ['completed', 'shipped', 'processing'] } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
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

    // Filter out null _id
    const salesMap = new Map(
      productSales
        .filter((item: any) => item._id != null)
        .map((item: any) => [item._id.toString(), item.totalSold])
    )

    const productsWithSales = products.map((product) => {
      const productObj = product.toObject()
      const productId = product._id.toString()
      productObj.actualSold = salesMap.get(productId) || 0
      return productObj
    })

    // 🆕 Build dynamic title
    let titleParts: string[] = ['Sản phẩm']
    let filenameParts: string[] = ['products']

    if (category) {
      const cat = await Product.findById(category).select('name')
      if (cat) {
        titleParts.push(`- ${cat.name}`)
        filenameParts.push('category')
      }
    }

    if (inStock === 'true') {
      titleParts.push('- Còn hàng')
      filenameParts.push('in-stock')
    } else if (inStock === 'false') {
      titleParts.push('- Hết hàng')
      filenameParts.push('out-of-stock')
    }

    const title = titleParts.join(' ')
    const filename = `${filenameParts.join('_')}_${
      new Date().toISOString().split('T')[0]
    }.xlsx`

    const buffer = await exportService.exportProductsToExcel(
      productsWithSales,
      title
    )

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
      query.ordersCount = { $gt: 0 }
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

// 4. Export All Data (Combined)
router.get('/all', async (req, res) => {
  try {
    console.log('📦 Starting export all data...')

    // 🔍 DEBUG: Check order items structure
    const debugOrder = (await Order.findOne({
      status: { $in: ['completed', 'shipped'] },
      items: { $exists: true, $ne: [] }
    }).lean()) as any

    if (debugOrder && debugOrder.items && debugOrder.items.length > 0) {
      console.log('🔍 DEBUG - Order Items Structure:')
      console.log(JSON.stringify(debugOrder.items[0], null, 2))
      console.log('🔍 Available fields:', Object.keys(debugOrder.items[0]))
    }

    const [orders, products, customers, productSales] = await Promise.all([
      Order.find().sort({ createdAt: -1 }),
      Product.find().populate('category', 'name').sort({ createdAt: -1 }),
      Customer.find().sort({ createdAt: -1 }),
      Order.aggregate([
        { $match: { status: { $in: ['completed', 'shipped', 'processing'] } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId', // ✅ FIX: Đổi từ product → productId
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

    console.log('📊 Product sales sample:', {
      first: productSales[0],
      nullCount: productSales.filter((item: any) => item._id == null).length
    })

    // Filter out null _id before mapping
    const salesMap = new Map(
      productSales
        .filter((item: any) => item._id != null)
        .map((item: any) => [item._id.toString(), item.totalSold])
    )

    console.log('🗺️ Sales map size:', salesMap.size)
    console.log(
      '🗺️ Sample sales map keys:',
      Array.from(salesMap.keys()).slice(0, 5)
    )

    // Add sold data to each product
    const productsWithSales = products.map((product) => {
      const productObj = product.toObject()
      const productId = product._id.toString()
      productObj.actualSold = salesMap.get(productId) || 0
      return productObj
    })

    console.log('📊 Products with sales:', {
      total: productsWithSales.length,
      withSales: productsWithSales.filter((p) => p.actualSold > 0).length,
      sample: {
        name: productsWithSales[0]?.name,
        actualSold: productsWithSales[0]?.actualSold
      }
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

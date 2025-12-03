import Customer from '../models/Customer'
import Order from '../models/Order'

/**
 * Cập nhật stats của customer dựa trên orders
 * Gọi hàm này mỗi khi:
 * - Tạo order mới
 * - Update order status (completed, cancelled)
 */
export async function updateCustomerStats(customerEmail: string) {
  try {
    if (!customerEmail) {
      console.log('⚠️ updateCustomerStats: No email provided')
      return
    }

    console.log('🔄 Updating stats for email:', customerEmail)

    // Tìm hoặc tạo customer
    let customer = await Customer.findOne({
      email: customerEmail.toLowerCase()
    })
    console.log('👤 Found customer:', customer ? customer.name : 'NOT FOUND')

    // Tính toán từ orders (chỉ tính orders không bị cancelled)
    // ✅ Sửa query: dùng customerEmail thay vì customer.email
    const orders = await Order.find({
      customerEmail: customerEmail.toLowerCase(),
      status: { $ne: 'cancelled' }
    }).lean()

    console.log('📦 Found orders:', orders.length)

    const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0)
    const ordersCount = orders.length
    const lastOrderDate =
      orders.length > 0
        ? new Date(
            Math.max(...orders.map((o) => new Date(o.createdAt).getTime()))
          )
        : null

    // Loyalty points: 1 điểm = 1000đ
    const loyaltyPoints = Math.floor(totalSpent / 1000)

    console.log('💰 Stats:', { totalSpent, ordersCount, loyaltyPoints })

    if (!customer) {
      // Tạo customer mới từ order đầu tiên
      const firstOrder = orders[0]
      if (!firstOrder) {
        console.log('⚠️ No orders found, skipping')
        return
      }

      console.log('✨ Creating new customer:', firstOrder.customerName)

      customer = await Customer.create({
        name: firstOrder.customerName || 'Guest',
        email: customerEmail.toLowerCase(),
        phone: firstOrder.customerPhone,
        password: null, // guest checkout
        totalSpent,
        ordersCount,
        lastOrderDate,
        loyaltyPoints,
        status: 'active'
      })

      console.log('✅ Customer created:', customer._id)
    } else {
      // Update stats (KHÔNG update name để tránh ghi đè)
      customer.totalSpent = totalSpent
      customer.ordersCount = ordersCount
      customer.lastOrderDate = lastOrderDate
      customer.loyaltyPoints = loyaltyPoints

      // ⚠️ KHÔNG update name/phone nếu customer đã tồn tại
      // Chỉ update nếu customer chưa có tên
      if (!customer.name || customer.name === 'Guest') {
        customer.name = orders[0]?.customerName || 'Guest'
      }

      if (!customer.phone) {
        customer.phone = orders[0]?.customerPhone
      }

      await customer.save() // Tier sẽ tự động update trong pre-save hook

      console.log('✅ Customer updated:', customer.name)
    }

    return customer
  } catch (err) {
    console.error('❌ Error updating customer stats:', err)
  }
}

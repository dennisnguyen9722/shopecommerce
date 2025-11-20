import Order from '../models/Order'
import User from '../models/User'
import { sendInvoiceEmail } from './emailService'

export async function updateOrderStatus(id: string, status: string) {
  const validStatus = ['pending', 'processing', 'completed', 'cancelled']
  if (!validStatus.includes(status)) {
    throw new Error('Invalid status')
  }

  const updated = (await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).lean()) as any

  if (!updated?._id) throw new Error('Order not found')

  // ✅ Nếu đơn hàng hoàn thành → gửi email hóa đơn
  if (status === 'completed') {
    const customerDoc = await User.findOne().lean()
    const orderData = {
      ...updated,
      customer:
        customerDoc && !Array.isArray(customerDoc)
          ? customerDoc
          : {
              name: 'Khách hàng ẩn danh',
              email: 'unknown@example.com',
              address: 'Chưa cập nhật'
            },
      items: [
        { name: 'Áo thun trắng', quantity: 2, price: 250000 },
        { name: 'Quần kaki', quantity: 1, price: 700000 }
      ]
    }

    await sendInvoiceEmail(orderData)
  }

  return updated
}

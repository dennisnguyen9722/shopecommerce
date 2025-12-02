import Order from '../models/Order'
import { sendInvoiceEmail } from './emailService'

export async function updateOrderStatus(id: string, status: string) {
  const validStatus = [
    'pending',
    'processing',
    'shipped',
    'completed',
    'cancelled'
  ]

  if (!validStatus.includes(status)) {
    throw new Error(
      `Invalid status: ${status}. Valid statuses: ${validStatus.join(', ')}`
    )
  }

  const updated = (await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).lean()) as any

  if (!updated?._id) throw new Error('Order not found')

  // ✅ Gửi email khi hoàn thành - dùng customerEmail từ order
  if (status === 'completed') {
    try {
      await sendInvoiceEmail(updated)
      console.log(`✅ Email hóa đơn đã gửi đến: ${updated.customerEmail}`)
    } catch (emailError: any) {
      console.error('⚠️ Lỗi gửi email hóa đơn:', emailError.message)
    }
  }

  return updated
}

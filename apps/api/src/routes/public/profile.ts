import express, { Request, Response } from 'express'
// 👇 Import Model đã sửa ở trên (nhớ check đường dẫn tương đối ../../)
import Customer from '../../models/Customer'
import { protect } from '../../middleware/auth'

const router = express.Router()

// PUT /public/profile - Cập nhật thông tin khách hàng
router.put('/', protect, async (req: any, res: Response) => {
  try {
    const { name, phone, address, avatar } = req.body

    // Lấy ID từ token (req.user do middleware protect giải mã)
    const customerId = req.user._id || req.user.id

    const customer = await Customer.findById(customerId)

    if (customer) {
      // Cập nhật các trường nếu có dữ liệu gửi lên
      customer.name = name || customer.name
      customer.phone = phone || customer.phone
      customer.address = address || customer.address
      customer.avatar = avatar || customer.avatar

      const updatedCustomer = await customer.save()

      // Trả về data mới cho Frontend
      res.json({
        _id: updatedCustomer._id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        avatar: updatedCustomer.avatar,

        // Các trường readonly
        role: 'customer',
        loyaltyPoints: updatedCustomer.loyaltyPoints,
        loyaltyTier: updatedCustomer.loyaltyTier,
        totalSpent: updatedCustomer.totalSpent
      })
    } else {
      res.status(404).json({ error: 'Không tìm thấy thông tin khách hàng' })
    }
  } catch (error) {
    console.error('Update Customer Error:', error)
    res.status(500).json({ error: 'Lỗi Server' })
  }
})

export default router

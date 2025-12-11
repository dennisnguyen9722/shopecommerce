import express, { Request, Response } from 'express'
import Customer from '../../models/Customer'
import CustomerAddress from '../../models/CustomerAddress' // 👈 Import Model Address
import { protect } from '../../middleware/auth'

const router = express.Router()

// ==========================================
// 1. PROFILE CHÍNH (GIỮ NGUYÊN CỦA BẠN)
// ==========================================
router.put('/', protect, async (req: any, res: Response) => {
  try {
    const { name, phone, address, avatar } = req.body
    const customerId = req.user._id || req.user.id

    const customer = await Customer.findById(customerId)

    if (customer) {
      customer.name = name || customer.name
      customer.phone = phone || customer.phone
      customer.address = address || customer.address
      customer.avatar = avatar || customer.avatar

      const updatedCustomer = await customer.save()

      res.json({
        _id: updatedCustomer._id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        avatar: updatedCustomer.avatar,
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

// ==========================================
// 2. QUẢN LÝ SỔ ĐỊA CHỈ (THÊM MỚI 👇)
// ==========================================

// GET: Lấy danh sách địa chỉ
router.get('/addresses', protect, async (req: any, res: Response) => {
  try {
    const addresses = await CustomerAddress.find({
      customer: req.user.id // 👈 Đổi từ _id → id
    }).sort({ isDefault: -1, createdAt: -1 })
    res.json(addresses)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST: Thêm địa chỉ mới
router.post('/addresses', protect, async (req: any, res: Response) => {
  try {
    console.log('📥 Received Payload:', req.body)
    console.log('👤 User ID:', req.user.id) // 👈 Đổi

    const { fullName, phone, addressLine1, ward, district, province } = req.body

    if (
      !fullName ||
      !phone ||
      !addressLine1 ||
      !ward ||
      !district ||
      !province
    ) {
      return res.status(400).json({
        error: 'Thiếu thông tin bắt buộc'
      })
    }

    const count = await CustomerAddress.countDocuments({
      customer: req.user.id // 👈 Đổi
    })

    const isDefault = count === 0 ? true : req.body.isDefault || false

    const address = await CustomerAddress.create({
      customer: req.user.id, // 👈 Đổi
      fullName,
      phone,
      addressLine1,
      addressLine2: req.body.addressLine2 || '',
      ward,
      district,
      province,
      country: req.body.country || 'Vietnam',
      isDefault
    })

    console.log('✅ Address created:', address._id)
    res.status(201).json(address)
  } catch (err: any) {
    console.error('❌ Create Address Error:', err)

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: Object.keys(err.errors).map((key) => ({
          field: key,
          message: err.errors[key].message
        }))
      })
    }

    res.status(500).json({
      error: 'Lỗi server',
      details: err.message
    })
  }
})

// PUT: Sửa địa chỉ
router.put('/addresses/:id', protect, async (req: any, res: Response) => {
  try {
    const address = await CustomerAddress.findOne({
      _id: req.params.id,
      customer: req.user.id // 👈 Đổi
    })

    if (!address)
      return res.status(404).json({ error: 'Không tìm thấy địa chỉ' })

    Object.assign(address, req.body)
    await address.save()

    res.json(address)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE: Xóa địa chỉ
router.delete('/addresses/:id', protect, async (req: any, res: Response) => {
  try {
    const address = await CustomerAddress.findOne({
      _id: req.params.id,
      customer: req.user.id // 👈 Đổi
    })

    if (!address)
      return res.status(404).json({ error: 'Không tìm thấy địa chỉ' })

    await address.deleteOne()
    res.json({ success: true, message: 'Đã xóa địa chỉ' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH: Đặt làm mặc định
router.patch(
  '/addresses/:id/set-default',
  protect,
  async (req: any, res: Response) => {
    try {
      const address = await CustomerAddress.findOne({
        _id: req.params.id,
        customer: req.user.id // 👈 Đổi
      })

      if (!address)
        return res.status(404).json({ error: 'Không tìm thấy địa chỉ' })

      address.isDefault = true
      await address.save()

      const newAddresses = await CustomerAddress.find({
        customer: req.user.id // 👈 Đổi
      }).sort({ isDefault: -1, createdAt: -1 })

      res.json(newAddresses)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  }
)

export default router

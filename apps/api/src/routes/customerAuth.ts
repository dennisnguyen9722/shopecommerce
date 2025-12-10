import express from 'express'
import jwt from 'jsonwebtoken'
import Customer from '../models/Customer'
import crypto from 'crypto' // 👇 Thêm import này
import bcrypt from 'bcryptjs' // 👇 Thêm import này
import { sendEmail } from '../utils/sendEmail' // 👈 Thêm dấu ngoặc nhọn

const router = express.Router()

// ... (Các route register, login, me GIỮ NGUYÊN KHÔNG ĐỔI)
// 🆕 REGISTER - Khách hàng đăng ký để tham gia loyalty
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' })
    }

    // Check existing
    const existing = await Customer.findOne({ email: email.toLowerCase() })
    if (existing && existing.password !== null) {
      return res.status(400).json({ error: 'Email đã được đăng ký' })
    }

    // Nếu đã có customer từ guest checkout, update thêm password
    if (existing && existing.password === null) {
      existing.name = name
      existing.password = password // Sẽ được hash bởi pre-save middleware trong model
      existing.phone = phone || existing.phone
      await existing.save()

      const token = jwt.sign(
        { id: existing._id, email: existing.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '30d' }
      )

      return res.status(201).json({
        token,
        customer: {
          id: existing._id,
          name: existing.name,
          email: existing.email,
          phone: existing.phone,
          loyaltyPoints: existing.loyaltyPoints,
          loyaltyTier: existing.loyaltyTier,
          totalSpent: existing.totalSpent,
          ordersCount: existing.ordersCount
        }
      })
    }

    // Create new
    const customer = await Customer.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      status: 'active'
    })

    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    )

    res.status(201).json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        loyaltyPoints: customer.loyaltyPoints,
        loyaltyTier: customer.loyaltyTier,
        totalSpent: customer.totalSpent,
        ordersCount: customer.ordersCount
      }
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// 🆕 LOGIN - Khách hàng đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' })
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() })

    if (!customer || !customer.password) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
    }

    if (customer.status !== 'active') {
      return res
        .status(403)
        .json({ error: 'Tài khoản đã bị khóa hoặc ngưng hoạt động' })
    }

    const isMatch = await customer.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
    }

    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    )

    res.json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        loyaltyPoints: customer.loyaltyPoints,
        loyaltyTier: customer.loyaltyTier,
        totalSpent: customer.totalSpent,
        ordersCount: customer.ordersCount
      }
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// 🆕 GET PROFILE - Lấy thông tin khách hàng hiện tại
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Không có token' })
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const customer = await Customer.findById(decoded.id).select('-password')

    if (!customer) {
      return res.status(404).json({ error: 'Không tìm thấy khách hàng' })
    }

    res.json(customer)
  } catch (err: any) {
    res.status(401).json({ error: 'Token không hợp lệ' })
  }
})

// 👇 ==========================================================
// 👇 CÁC ROUTE MỚI CHO FORGOT PASSWORD
// 👇 ==========================================================

// 1️⃣ FORGOT PASSWORD (Gửi Email)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Vui lòng nhập email' })

    const customer = await Customer.findOne({ email: email.toLowerCase() })

    if (!customer) {
      return res
        .status(404)
        .json({ error: 'Không tìm thấy tài khoản với email này' })
    }

    // Tạo token reset từ method trong Model
    const resetToken = customer.getResetPasswordToken()
    await customer.save({ validateBeforeSave: false })

    // Tạo Link Reset (Frontend URL)
    // Cần đảm bảo process.env.FRONTEND_URL đúng (ví dụ http://localhost:3000)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`

    const message = `Bạn nhận được email này vì có yêu cầu đặt lại mật khẩu cho tài khoản Dennis Shop.\n\nHãy bấm vào link dưới đây để đặt lại mật khẩu (Link hết hạn sau 10 phút):\n\n${resetUrl}\n\nNếu không phải bạn, vui lòng bỏ qua email này.`

    try {
      await sendEmail({
        to: customer.email, // 👈 Đổi 'email' thành 'to'
        subject: 'Khôi phục mật khẩu - Dennis Shop',
        text: message // 👈 Đổi 'message' thành 'text'
        // html: message.replace(/\n/g, '<br>') // (Optional) Nếu muốn gửi dạng HTML
      })

      res
        .status(200)
        .json({ success: true, data: 'Email hướng dẫn đã được gửi!' })
    } catch (err) {
      console.error('Send mail error:', err)
      // Nếu gửi lỗi thì xóa token đi để tránh kẹt
      customer.resetPasswordToken = undefined
      customer.resetPasswordExpire = undefined
      await customer.save({ validateBeforeSave: false })

      return res
        .status(500)
        .json({ error: 'Không thể gửi email. Vui lòng thử lại sau.' })
    }
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// 2️⃣ RESET PASSWORD (Đổi mật khẩu mới)
router.put('/reset-password/:resetToken', async (req, res) => {
  try {
    const { password } = req.body
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    }

    // Hash token từ URL để so sánh với DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex')

    const customer = await Customer.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() } // Kiểm tra còn hạn
    })

    if (!customer) {
      return res
        .status(400)
        .json({ error: 'Token không hợp lệ hoặc đã hết hạn' })
    }

    // Set mật khẩu mới (Chưa hash, để middleware pre-save tự hash)
    // LƯU Ý: Trong model bạn có middleware pre('save') để hash pass không?
    // Nếu trong model Customer.ts bạn CHƯA có middleware hash password (thường dùng bcrypt.hash),
    // thì bạn cần hash thủ công ở đây:
    const salt = await bcrypt.genSalt(10)
    customer.password = await bcrypt.hash(password, salt)

    // Xóa token
    customer.resetPasswordToken = undefined
    customer.resetPasswordExpire = undefined

    await customer.save()

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.'
    })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ==========================================================
// 3️⃣ CHANGE PASSWORD (Đổi mật khẩu khi đang đăng nhập - CẦN AUTH)
// ==========================================================
router.put('/change-password', async (req, res) => {
  try {
    // 1. Kiểm tra Token (Xác thực người dùng)
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Bạn chưa đăng nhập' })
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const customer = await Customer.findById(decoded.id)

    if (!customer || !customer.password) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản' })
    }

    // 2. Lấy dữ liệu từ Client
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng nhập đủ thông tin' })
    }

    // 3. Kiểm tra mật khẩu cũ có đúng không
    // Lưu ý: customer.password là hash, phải dùng bcrypt.compare
    // Nếu bạn chưa import bcrypt thì nhớ import ở đầu file: import bcrypt from 'bcryptjs'
    const isMatch = await bcrypt.compare(currentPassword, customer.password)

    if (!isMatch) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' })
    }

    // 4. Mã hóa mật khẩu mới và lưu
    const salt = await bcrypt.genSalt(10)
    customer.password = await bcrypt.hash(newPassword, salt)

    await customer.save()

    res.json({ success: true, message: 'Đổi mật khẩu thành công' })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Lỗi server hoặc token hết hạn' })
  }
})

export default router

import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto' // 👈 Import thêm crypto để tạo token

// 1. Define Methods Interface
interface ICustomerMethods {
  matchPassword(enteredPassword: string): Promise<boolean>
  calculateLoyaltyTier(): 'bronze' | 'silver' | 'gold' | 'platinum'
  // 👇 MỚI: Method tạo token reset
  getResetPasswordToken(): string
}

// 2. Define Model Type
type CustomerModel = Model<ICustomer, {}, ICustomerMethods>

// 3. Define Document Interface (TypeScript Types)
export interface ICustomer extends Document, ICustomerMethods {
  name: string
  email: string
  password?: string

  phone?: string
  address?: string
  avatar?: string | null

  tags: string[]
  notes?: string

  status: 'active' | 'blocked' | 'suspended' | 'deactivated'

  // Loyalty Program
  loyaltyPoints: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'

  // Stats
  totalSpent: number
  ordersCount: number
  averageOrderValue: number
  lastOrderDate: Date | null

  // 👇 MỚI: Các trường cho Reset Password
  resetPasswordToken?: string
  resetPasswordExpire?: Date

  createdAt: Date
  updatedAt: Date
}

// 4. Define Mongoose Schema (Database Structure)
const CustomerSchema = new Schema<ICustomer, CustomerModel, ICustomerMethods>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, default: null },

    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    avatar: { type: String, default: null },

    tags: { type: [String], default: [] },
    notes: { type: String },

    status: {
      type: String,
      enum: ['active', 'blocked', 'suspended', 'deactivated'],
      default: 'active',
      index: true
    },

    // Loyalty
    loyaltyPoints: { type: Number, default: 0 },
    loyaltyTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },

    // Stats
    totalSpent: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    lastOrderDate: { type: Date, default: null },

    // 👇 MỚI: Lưu token reset (đã hash) và thời gian hết hạn
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date }
  },
  { timestamps: true }
)

// Match password method
CustomerSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  if (!this.password) return false
  return await bcrypt.compare(enteredPassword, this.password)
}

// Calculate loyalty tier method
CustomerSchema.methods.calculateLoyaltyTier = function ():
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum' {
  if (this.totalSpent >= 20_000_000) return 'platinum'
  if (this.totalSpent >= 10_000_000) return 'gold'
  if (this.totalSpent >= 5_000_000) return 'silver'
  return 'bronze'
}

// 👇 MỚI: Method tạo Reset Password Token
CustomerSchema.methods.getResetPasswordToken = function (): string {
  // 1. Tạo token ngẫu nhiên (20 bytes -> hex)
  const resetToken = crypto.randomBytes(20).toString('hex')

  // 2. Hash token (SHA256) trước khi lưu vào Database (để bảo mật)
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // 3. Thiết lập thời gian hết hạn (10 phút)
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000)

  // 4. Trả về token GỐC (chưa hash) để gửi qua email cho user
  return resetToken
}

// Middleware: Auto update tier before save
CustomerSchema.pre('save', function (next) {
  this.loyaltyTier = this.calculateLoyaltyTier()
  if (this.ordersCount > 0) {
    this.averageOrderValue = this.totalSpent / this.ordersCount
  }
  next()
})

// Indexes
CustomerSchema.index({
  name: 'text',
  email: 'text',
  phone: 'text'
})
CustomerSchema.index({ createdAt: -1 })
CustomerSchema.index({ ordersCount: -1 })
CustomerSchema.index({ totalSpent: -1 })
CustomerSchema.index({ loyaltyPoints: -1 })

export default (mongoose.models.Customer as CustomerModel) ||
  mongoose.model<ICustomer, CustomerModel>('Customer', CustomerSchema)

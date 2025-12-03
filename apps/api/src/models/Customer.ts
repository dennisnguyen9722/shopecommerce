import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

interface ICustomerMethods {
  matchPassword(enteredPassword: string): Promise<boolean>
  calculateLoyaltyTier(): 'bronze' | 'silver' | 'gold' | 'platinum'
}

type CustomerModel = Model<ICustomer, {}, ICustomerMethods>

export interface ICustomer extends Document, ICustomerMethods {
  name: string
  email: string
  password?: string // Đổi thành optional string
  phone?: string

  // 👇 THÊM AVATAR VÀO INTERFACE
  avatar?: string | null

  tags: string[]
  notes?: string

  status: 'active' | 'blocked' | 'suspended' | 'deactivated'

  // Loyalty Program
  loyaltyPoints: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'

  // Stats (tự động tính từ orders)
  totalSpent: number
  ordersCount: number
  averageOrderValue: number
  lastOrderDate: Date | null

  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer, CustomerModel, ICustomerMethods>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, default: null },
    phone: { type: String },

    // 👇 THÊM AVATAR VÀO SCHEMA
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
    lastOrderDate: { type: Date, default: null }
  },
  { timestamps: true }
)

// 🛑 ĐÃ XÓA đoạn pre('save') hash password để tránh bị hash 2 lần
// Vì bên controller (auth.ts) chúng ta đã hash thủ công rồi.

// Match password
CustomerSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  if (!this.password) return false
  return await bcrypt.compare(enteredPassword, this.password)
}

// Calculate loyalty tier based on totalSpent
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

// Auto update tier before save
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

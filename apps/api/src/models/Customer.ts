import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICustomer extends Document {
  name: string
  email: string
  phone?: string
  tags: string[]
  notes?: string

  status: 'active' | 'blocked' | 'suspended' | 'deactivated'

  totalSpent: number
  ordersCount: number
  lastOrderDate: Date | null

  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String },

    tags: { type: [String], default: [] },
    notes: { type: String },

    status: {
      type: String,
      enum: ['active', 'blocked', 'suspended', 'deactivated'],
      default: 'active',
      index: true
    },

    totalSpent: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    lastOrderDate: { type: Date, default: null }
  },
  { timestamps: true }
)

// text search
CustomerSchema.index({
  name: 'text',
  email: 'text',
  phone: 'text'
})

// some useful indexes
CustomerSchema.index({ createdAt: -1 })
CustomerSchema.index({ ordersCount: -1 })
CustomerSchema.index({ totalSpent: -1 })

export default (mongoose.models.Customer as Model<ICustomer>) ||
  mongoose.model<ICustomer>('Customer', CustomerSchema)

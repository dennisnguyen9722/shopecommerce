// apps/api/src/models/Reward.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReward extends Document {
  name: string
  description: string
  pointsRequired: number

  // Reward type and value
  type: 'discount_percentage' | 'discount_fixed' | 'free_shipping' | 'gift'
  value: string | number

  // 👇 THÊM TRƯỜNG MỚI
  codePrefix: string

  // Constraints
  minOrderValue?: number
  maxDiscountAmount?: number

  // Availability
  tierRequired?: 'bronze' | 'silver' | 'gold' | 'platinum'
  stock?: number
  validFrom?: Date
  validUntil?: Date

  // Settings
  isActive: boolean
  order: number
  imageUrl?: string

  createdAt: Date
  updatedAt: Date
}

const RewardSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    // 👇 THÊM TRƯỜNG NÀY
    codePrefix: {
      type: String,
      uppercase: true,
      trim: true,
      default: 'REWARD' // Mặc định nếu không nhập
    },
    description: {
      type: String,
      required: true
    },
    pointsRequired: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: ['discount_percentage', 'discount_fixed', 'free_shipping', 'gift'],
      required: true
    },
    value: {
      type: Schema.Types.Mixed,
      required: true
    },

    // Constraints
    minOrderValue: {
      type: Number,
      min: 0,
      default: 0
    },
    maxDiscountAmount: {
      type: Number,
      min: 0
    },

    // Availability
    tierRequired: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    },
    stock: {
      type: Number,
      min: 0
    },
    validFrom: {
      type: Date
    },
    validUntil: {
      type: Date
    },

    // Settings
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    },
    imageUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

// Indexes
RewardSchema.index({ isActive: 1, order: 1 })
RewardSchema.index({ pointsRequired: 1 })
RewardSchema.index({ tierRequired: 1 })

export default (mongoose.models.Reward as Model<IReward>) ||
  mongoose.model<IReward>('Reward', RewardSchema)

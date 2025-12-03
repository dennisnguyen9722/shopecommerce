// models/PointsHistory.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPointsHistory extends Document {
  customerId: mongoose.Types.ObjectId
  points: number
  type: 'earn' | 'redeem' | 'bonus' | 'expire' | 'refund' | 'admin_adjust'
  description: string
  orderId?: mongoose.Types.ObjectId
  rewardId?: mongoose.Types.ObjectId

  // Metadata
  metadata?: {
    orderTotal?: number
    multiplier?: number
    rewardName?: string
    adminNote?: string
    [key: string]: any
  }

  createdAt: Date
  updatedAt: Date
}

const PointsHistorySchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    points: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['earn', 'redeem', 'bonus', 'expire', 'refund', 'admin_adjust'],
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    rewardId: {
      type: Schema.Types.ObjectId,
      ref: 'Reward'
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
)

// Indexes for faster queries
PointsHistorySchema.index({ customerId: 1, createdAt: -1 })
PointsHistorySchema.index({ type: 1, createdAt: -1 })

export default (mongoose.models.PointsHistory as Model<IPointsHistory>) ||
  mongoose.model<IPointsHistory>('PointsHistory', PointsHistorySchema)

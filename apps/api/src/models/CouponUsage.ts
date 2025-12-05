import mongoose, { Schema, Document } from 'mongoose'

export interface ICouponUsage extends Document {
  coupon: mongoose.Types.ObjectId
  customer: mongoose.Types.ObjectId
  order: mongoose.Types.ObjectId
  discountAmount: number
  usedAt: Date
}

const CouponUsageSchema = new Schema<ICouponUsage>(
  {
    coupon: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

CouponUsageSchema.index({ coupon: 1, customer: 1 })
CouponUsageSchema.index({ customer: 1 })
CouponUsageSchema.index({ order: 1 })

export default mongoose.model<ICouponUsage>('CouponUsage', CouponUsageSchema)

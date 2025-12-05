import mongoose, { Schema, Document } from 'mongoose'

export interface ICoupon extends Document {
  code: string
  description: string
  discountType: 'percentage' | 'fixed' | 'free_shipping'
  discountValue: number
  maxDiscountAmount?: number
  minOrderAmount?: number
  usageLimit?: number
  usageLimitPerUser?: number
  usedCount: number
  startDate: Date
  endDate: Date
  isActive: boolean
  applicableProducts?: mongoose.Types.ObjectId[]
  applicableCategories?: mongoose.Types.ObjectId[]
  customerType?: 'all' | 'new' | 'existing'
  autoApply: boolean
  firstPurchaseOnly: boolean
  excludeDiscountedProducts: boolean
  maxUsagePerOrder?: number
  createdAt: Date
  updatedAt: Date
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'free_shipping'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    maxDiscountAmount: {
      type: Number,
      min: 0
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    usageLimit: {
      type: Number,
      min: 1
    },
    usageLimitPerUser: {
      type: Number,
      default: 1,
      min: 1
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },

    // Áp dụng danh sách sản phẩm
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],

    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],

    customerType: {
      type: String,
      enum: ['all', 'new', 'existing'],
      default: 'all'
    },

    autoApply: {
      type: Boolean,
      default: false
    },

    // ⚡ NEW: Chỉ áp dụng cho đơn hàng đầu tiên
    firstPurchaseOnly: {
      type: Boolean,
      default: false
    },

    // ⚡ NEW: Không áp dụng cho sản phẩm đã giảm giá
    excludeDiscountedProducts: {
      type: Boolean,
      default: false
    },

    // ⚡ NEW: Mỗi order được dùng tối đa X lần (thường =1)
    maxUsagePerOrder: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  {
    timestamps: true
  }
)

// CouponSchema.index({ code: 1 })
CouponSchema.index({ isActive: 1, startDate: 1, endDate: 1 })

export default mongoose.model<ICoupon>('Coupon', CouponSchema)

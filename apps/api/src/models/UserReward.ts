// models/UserReward.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUserReward extends Document {
  customerId: mongoose.Types.ObjectId
  rewardId: mongoose.Types.ObjectId

  voucherCode: string
  status: 'active' | 'used' | 'expired'

  redeemedAt: Date
  usedAt?: Date
  usedInOrderId?: mongoose.Types.ObjectId
  expiresAt: Date

  createdAt: Date
  updatedAt: Date

  // Methods
  isValid(): boolean
}

const UserRewardSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true // ✅ Đã tạo index ở đây
    },
    rewardId: {
      type: Schema.Types.ObjectId,
      ref: 'Reward',
      required: true
    },
    voucherCode: {
      type: String,
      required: true,
      unique: true, // ✅ unique tự động tạo index rồi
      uppercase: true
    },
    status: {
      type: String,
      enum: ['active', 'used', 'expired'],
      default: 'active',
      index: true // ✅ Đã tạo index ở đây
    },
    redeemedAt: {
      type: Date,
      default: Date.now
    },
    usedAt: {
      type: Date
    },
    usedInOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true // ✅ Đã tạo index ở đây
    }
  },
  {
    timestamps: true
  }
)

// Indexes
// Giữ lại cái này vì đây là index kép (compound index), không khai báo trong field được
UserRewardSchema.index({ customerId: 1, status: 1 })

// ❌ XÓA 2 DÒNG NÀY ĐI VÌ ĐÃ KHAI BÁO TRÊN FIELD RỒI
// UserRewardSchema.index({ voucherCode: 1 })
// UserRewardSchema.index({ expiresAt: 1 })

// Method to check if voucher is valid
UserRewardSchema.methods.isValid = function (): boolean {
  return this.status === 'active' && this.expiresAt > new Date()
}

export default (mongoose.models.UserReward as Model<IUserReward>) ||
  mongoose.model<IUserReward>('UserReward', UserRewardSchema)

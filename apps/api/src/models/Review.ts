import mongoose from 'mongoose'

const ReplySchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // <--- Sửa true thành false (hoặc xóa luôn dòng này)
    },
    adminName: String,
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
)

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },

    customerName: String,
    customerEmail: String,
    isAnonymous: Boolean,

    rating: Number,
    content: String,
    images: [String],

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },

    // ⭐ NEW: Admin replies
    replies: {
      type: [ReplySchema],
      default: []
    }
  },
  { timestamps: true }
)

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema)

export default Review

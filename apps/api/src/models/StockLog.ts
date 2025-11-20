import mongoose, { Schema } from 'mongoose'

const StockLogSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    change: {
      type: Number,
      required: true // +10, -3
    },
    oldStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['import', 'adjust', 'order', 'return'],
      required: true
    },
    note: {
      type: String
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.models.StockLog ||
  mongoose.model('StockLog', StockLogSchema)

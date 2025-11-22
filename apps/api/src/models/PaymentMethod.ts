import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPaymentMethod extends Document {
  key: 'cod' | 'bank' | 'stripe' | 'momo'
  name: string
  enabled: boolean
  sortOrder: number
  config: any

  createdAt: Date
  updatedAt: Date
}

const PaymentMethodSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ['cod', 'bank', 'stripe', 'momo']
    },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    config: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
)

export default (mongoose.models.PaymentMethod as Model<IPaymentMethod>) ||
  mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema)

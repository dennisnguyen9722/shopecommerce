import mongoose, { Schema, Document } from 'mongoose'
import { BankTransferConfig } from '../types/payment'

export interface IPaymentMethod extends Document {
  key: 'cod' | 'bank' | 'stripe' | 'momo'
  name: string
  enabled: boolean
  sortOrder: number
  config: BankTransferConfig | any

  createdAt: Date
  updatedAt: Date
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    config: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
)

export default mongoose.models.PaymentMethod ||
  mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema)

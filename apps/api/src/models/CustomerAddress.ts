import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICustomerAddress extends Document {
  customer: mongoose.Types.ObjectId
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  ward?: string
  district?: string
  province?: string
  country: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    ward: String,
    district: String,
    province: String,
    country: { type: String, default: 'Vietnam' },

    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
)

AddressSchema.index({ customer: 1 })
AddressSchema.index({ isDefault: 1 })

export default (mongoose.models.CustomerAddress as Model<ICustomerAddress>) ||
  mongoose.model<ICustomerAddress>('CustomerAddress', AddressSchema)

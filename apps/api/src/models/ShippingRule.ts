import mongoose, { Schema, Document, Model } from 'mongoose'

const locationSchema = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true }
  },
  { _id: false }
)

export interface IShippingRule extends Document {
  type:
    | 'flat'
    | 'free_over'
    | 'location_based'
    | 'weight_based'
    | 'district_based'
  name: string
  amount?: number
  threshold?: number
  areas?: string[]
  minWeight?: number
  maxWeight?: number

  province?: { code: string; name: string }
  districts?: Array<{ code: string; name: string }>

  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const ShippingRuleSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        'flat',
        'free_over',
        'location_based',
        'weight_based',
        'district_based'
      ],
      required: true
    },
    name: { type: String, required: true },
    amount: { type: Number },
    threshold: { type: Number },
    areas: { type: [String], default: [] },
    minWeight: { type: Number },
    maxWeight: { type: Number },

    province: locationSchema,
    districts: [locationSchema],

    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
)

export default (mongoose.models.ShippingRule as Model<IShippingRule>) ||
  mongoose.model<IShippingRule>('ShippingRule', ShippingRuleSchema)

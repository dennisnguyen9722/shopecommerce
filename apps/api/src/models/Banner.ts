import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBanner extends Document {
  imageUrl: string
  title?: string
  subtitle?: string
  link?: string
  position: 'home_top' | 'home_middle' | 'home_bottom'
  order: number
  isActive: boolean

  createdAt: Date
  updatedAt: Date
}

const BannerSchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    title: { type: String },
    subtitle: { type: String },
    link: { type: String },
    position: {
      type: String,
      enum: ['homepage', 'home', 'slider', 'product', 'category'],
      default: 'homepage',
      required: true
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export default (mongoose.models.Banner as Model<IBanner>) ||
  mongoose.model<IBanner>('Banner', BannerSchema)

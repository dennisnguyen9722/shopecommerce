import mongoose, { Schema, Document } from 'mongoose'

export interface IBrand extends Document {
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  status: 'active' | 'inactive'
  productsCount: number
  createdAt: Date
  updatedAt: Date
}

const BrandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    logo: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    },
    productsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

// Indexes for search and sort
BrandSchema.index({ name: 'text', description: 'text' })
BrandSchema.index({ createdAt: -1 })
BrandSchema.index({ productsCount: -1 })

// Auto-generate slug from name if not provided
BrandSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  next()
})

export default mongoose.models.Brand ||
  mongoose.model<IBrand>('Brand', BrandSchema)

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICategory extends Document {
  name: string
  slug: string
  description?: string
  parent: mongoose.Types.ObjectId | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },

    // ❌ remove unique/index to avoid duplicate definition
    slug: { type: String, required: true },

    description: String,

    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

/* --------------------------------------------------------
| INDEXES (CLEAN – ONLY DECLARED ONCE)
|--------------------------------------------------------*/

// Text search chỉ áp dụng cho name (KHÔNG ĐƯỢC include slug!)
CategorySchema.index({ name: 'text' })

// Unique slug index (ONLY this one!)
CategorySchema.index({ slug: 1 }, { unique: true })

// Query filters
CategorySchema.index({ isActive: 1 })
CategorySchema.index({ parent: 1 })
CategorySchema.index({ createdAt: -1 })

export default (mongoose.models.Category as Model<ICategory>) ||
  mongoose.model<ICategory>('Category', CategorySchema)

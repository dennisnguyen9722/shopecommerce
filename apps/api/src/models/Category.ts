import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICategory extends Document {
  name: string
  slug: string
  description?: string
  parent: mongoose.Types.ObjectId | null
  isActive: boolean

  // ⭐ thêm icon
  icon?: {
    url: string
    public_id: string
  } | null

  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },

    slug: { type: String, required: true },

    description: String,

    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },

    isActive: { type: Boolean, default: true },

    // ⭐ FIELD ICON – hỗ trợ upload Cloudinary
    icon: {
      url: { type: String, default: null },
      public_id: { type: String, default: null }
    }
  },
  { timestamps: true }
)

/* --------------------------------------------------------
| INDEXES (KHÔNG ĐỤNG VÀO, VẪN GIỮ NGUYÊN)
--------------------------------------------------------- */

// Text search
CategorySchema.index({ name: 'text' })

// Unique slug
CategorySchema.index({ slug: 1 }, { unique: true })

// Query filters
CategorySchema.index({ isActive: 1 })
CategorySchema.index({ parent: 1 })
CategorySchema.index({ createdAt: -1 })

export default (mongoose.models.Category as Model<ICategory>) ||
  mongoose.model<ICategory>('Category', CategorySchema)

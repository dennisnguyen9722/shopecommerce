import mongoose, { Schema } from 'mongoose'

// Image schema
const ImageSchema = new Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  alt: String
})

// Variant schema
const VariantSchema = new Schema({
  name: String,
  price: Number,
  stock: Number,
  options: Schema.Types.Mixed
})

// Product schema
const ProductSchema = new Schema(
  {
    name: { type: String, required: true },

    slug: { type: String, required: true },

    description: String,

    price: { type: Number, required: true },
    comparePrice: { type: Number, default: 0 },

    stock: { type: Number, default: 0 },

    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },

    categories: [String],
    tags: [String],

    images: [ImageSchema],
    variants: [VariantSchema],

    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
)

// Virtuals
ProductSchema.virtual('hasDiscount').get(function () {
  return (
    typeof this.comparePrice === 'number' &&
    this.comparePrice > 0 &&
    this.comparePrice > this.price
  )
})

ProductSchema.virtual('discountPercent').get(function () {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0

  return Math.round(
    ((this.comparePrice - this.price) / this.comparePrice) * 100
  )
})

ProductSchema.set('toJSON', { virtuals: true })
ProductSchema.set('toObject', { virtuals: true })

/* --------------------------------------------------------
| CLEAN INDEXES (NO DUPLICATES)
|--------------------------------------------------------*/

// Unique slug (only this!)
ProductSchema.index({ slug: 1 }, { unique: true })

// Useful query indexes
ProductSchema.index({ category: 1 })
ProductSchema.index({ isPublished: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ createdAt: -1 })

export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema)

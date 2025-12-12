import mongoose, { Schema, Document } from 'mongoose'

// =========================================================
// 1. IMAGE SCHEMA
// =========================================================
const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    alt: { type: String, default: '' }
  },
  { _id: false }
)

// =========================================================
// 2. VARIANT SCHEMA
// =========================================================
const VariantSchema = new Schema({
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: { type: String, default: '' },
  options: {
    type: Map,
    of: String
  }
})

// =========================================================
// 3. PRODUCT SCHEMA (MAIN) - ✅ UPDATED WITH BRAND
// =========================================================
const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    description: { type: String, default: '' },

    // ✅ UPDATED: Brand as ObjectId reference
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      default: null
    },

    price: { type: Number, required: true },
    comparePrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },

    // Category reference
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },

    images: [ImageSchema],

    // Variant configuration
    hasVariants: { type: Boolean, default: false },
    variantGroups: [
      {
        name: String,
        values: [String]
      }
    ],
    variants: [VariantSchema],

    // Specs
    specs: [
      {
        key: String,
        value: String,
        _id: false
      }
    ],

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },

    // Status
    isPublished: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isHot: { type: Boolean, default: false },

    // Stats
    sold: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    // Rating
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true
    },
    totalReviews: {
      type: Number,
      default: 0,
      index: true
    },
    ratingDistribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
)

// =========================================================
// 4. VIRTUAL FIELDS
// =========================================================
ProductSchema.virtual('hasDiscount').get(function () {
  return (
    typeof this.comparePrice === 'number' &&
    this.comparePrice > 0 &&
    this.comparePrice > this.price
  )
})

ProductSchema.virtual('discountPercent').get(function () {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0
  const percent = ((this.comparePrice - this.price) / this.comparePrice) * 100
  return Math.round(percent)
})

ProductSchema.set('toJSON', { virtuals: true })
ProductSchema.set('toObject', { virtuals: true })

// =========================================================
// 5. INDEXES
// =========================================================
ProductSchema.index({ name: 'text', description: 'text' })
ProductSchema.index({ category: 1 })
ProductSchema.index({ brand: 1 }) // ✅ NEW: Index for brand
ProductSchema.index({ price: 1 })
ProductSchema.index({ createdAt: -1 })

// =========================================================
// 6. MIDDLEWARE - Update Brand productsCount
// =========================================================
// When product is saved with brand
ProductSchema.post('save', async function () {
  if (this.brand) {
    const Brand = mongoose.model('Brand')
    const count = await mongoose
      .model('Product')
      .countDocuments({ brand: this.brand })
    await Brand.findByIdAndUpdate(this.brand, { productsCount: count })
  }
})

// When product is deleted
ProductSchema.post('findOneAndDelete', async function (doc) {
  if (doc && doc.brand) {
    const Brand = mongoose.model('Brand')
    const count = await mongoose
      .model('Product')
      .countDocuments({ brand: doc.brand })
    await Brand.findByIdAndUpdate(doc.brand, { productsCount: count })
  }
})

export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema)

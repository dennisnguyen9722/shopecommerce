import mongoose, { Schema } from 'mongoose'

// 1. IMAGE SCHEMA (Giữ nguyên)
const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    alt: String
  },
  { _id: false }
)

// 2. VARIANT SCHEMA (NÂNG CẤP)
// Dùng để lưu từng phiên bản cụ thể: Ví dụ "iPhone 15 - Đỏ - 256GB"
const VariantSchema = new Schema({
  sku: { type: String, required: true }, // Mã kho (Bắt buộc để quản lý kho)
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: { type: String }, // Ảnh đại diện riêng cho variant này (VD: Màu đỏ hiện ảnh đỏ)

  // Lưu các lựa chọn cụ thể. VD: { "Màu sắc": "Đỏ", "Dung lượng": "256GB" }
  options: {
    type: Map,
    of: String
  }
})

// 3. PRODUCT SCHEMA
const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    brand: String, // Thêm thương hiệu (Apple, Samsung...)

    // Giá hiển thị chung (Min price hoặc giá đại diện)
    price: { type: Number, required: true },
    comparePrice: { type: Number, default: 0 },

    // Tổng tồn kho (cộng dồn từ variants hoặc nhập tay nếu ko có variant)
    stock: { type: Number, default: 0 },

    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },

    // Giữ lại để tương thích code cũ của bạn
    categories: [String],
    tags: [String],

    images: [ImageSchema],

    // 🔥 QUAN TRỌNG: CẤU HÌNH BIẾN THỂ
    hasVariants: { type: Boolean, default: false },

    // Định nghĩa các nhóm tùy chọn để render UI
    // VD: [{ name: "Màu sắc", values: ["Đỏ", "Xanh"] }, { name: "Bộ nhớ", values: ["128GB", "256GB"] }]
    variantGroups: [
      {
        name: String,
        values: [String]
      }
    ],

    // Danh sách các biến thể thực tế (kết hợp từ các nhóm trên)
    variants: [VariantSchema],

    // 🔥 MODULE 1: THÔNG SỐ KỸ THUẬT (Làm luôn cho tiện)
    specs: [
      {
        key: String, // VD: "Chip xử lý"
        value: String // VD: "Apple A17 Pro"
      }
    ],

    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // Stats
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
  },
  { timestamps: true }
)

// 4. VIRTUALS (Giữ nguyên logic của bạn)
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
| INDEXES
|--------------------------------------------------------*/
ProductSchema.index({ category: 1 })
ProductSchema.index({ isPublished: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ createdAt: -1 })

// Text search index (để tìm kiếm sản phẩm sau này)
ProductSchema.index({ name: 'text', description: 'text', brand: 'text' })

export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema)

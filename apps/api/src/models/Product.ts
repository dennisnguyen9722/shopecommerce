import mongoose, { Schema, Document } from 'mongoose'

// =========================================================
// 1. IMAGE SCHEMA
// =========================================================
const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    alt: { type: String, default: '' } // Nên có default rỗng
  },
  { _id: false }
)

// =========================================================
// 2. VARIANT SCHEMA
// =========================================================
const VariantSchema = new Schema({
  // SKU: Mã định danh duy nhất cho biến thể (VD: SKU-IP15-DEN-256)
  sku: { type: String, required: true },

  price: { type: Number, required: true },

  // Tồn kho riêng cho biến thể này
  stock: { type: Number, default: 0 },

  // 🔥 QUAN TRỌNG: Ảnh đại diện cho biến thể (để đổi màu khi click)
  // Lưu URL string cho đơn giản và khớp với Frontend hiện tại
  image: { type: String, default: '' },

  // Map options: { "Màu sắc": "Đỏ", "Size": "XL" }
  options: {
    type: Map,
    of: String
  }
})

// =========================================================
// 3. PRODUCT SCHEMA (MAIN)
// =========================================================
const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    // Slug bắt buộc unique để URL không bị trùng
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    description: { type: String, default: '' },
    brand: { type: String, default: 'No Brand' },

    // Giá hiển thị đại diện
    price: { type: Number, required: true },
    comparePrice: { type: Number, default: 0 },

    // Tổng tồn kho (Nếu có variants thì cộng dồn, nếu không thì nhập tay)
    stock: { type: Number, default: 0 },

    // Liên kết Category
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },

    // Mảng ảnh (Ảnh đầu tiên thường là ảnh đại diện)
    images: [ImageSchema],

    // 🟢 CẤU HÌNH BIẾN THỂ
    hasVariants: { type: Boolean, default: false },

    // Định nghĩa nhóm: [{ name: "Màu sắc", values: ["Đỏ", "Xanh"] }]
    variantGroups: [
      {
        name: String,
        values: [String]
      }
    ],

    // Danh sách biến thể chi tiết
    variants: [VariantSchema],

    // 🟢 THÔNG SỐ KỸ THUẬT (Specs)
    specs: [
      {
        key: String,
        value: String,
        _id: false // Không cần tạo ID cho từng dòng spec
      }
    ],

    // 🟢 SEO FIELDS (BỔ SUNG QUAN TRỌNG CHO BÁN HÀNG)
    metaTitle: { type: String }, // Tiêu đề hiển thị trên Google
    metaDescription: { type: String }, // Mô tả hiển thị trên Google

    // Trạng thái
    isPublished: { type: Boolean, default: true, index: true }, // Có đang bán không
    isFeatured: { type: Boolean, default: false, index: true }, // Có phải SP nổi bật không
    isHot: { type: Boolean, default: false }, // SP đang Hot/Bán chạy

    // Thống kê (Dùng để sort hoặc filter)
    sold: { type: Number, default: 0 }, // Đã bán
    viewCount: { type: Number, default: 0 }, // Lượt xem
    rating: { type: Number, default: 0 }, // Điểm đánh giá trung bình
    numReviews: { type: Number, default: 0 } // Số lượng đánh giá
  },
  {
    timestamps: true // Tự động tạo createdAt, updatedAt
  }
)

// =========================================================
// 4. VIRTUAL FIELDS (Trường ảo - Không lưu DB nhưng tính toán được)
// =========================================================

// Kiểm tra xem có đang giảm giá không
ProductSchema.virtual('hasDiscount').get(function () {
  return (
    typeof this.comparePrice === 'number' &&
    this.comparePrice > 0 &&
    this.comparePrice > this.price
  )
})

// Tính phần trăm giảm giá (VD: 20%)
ProductSchema.virtual('discountPercent').get(function () {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0
  const percent = ((this.comparePrice - this.price) / this.comparePrice) * 100
  return Math.round(percent)
})

// Config để khi res.json() sẽ bao gồm cả virtuals
ProductSchema.set('toJSON', { virtuals: true })
ProductSchema.set('toObject', { virtuals: true })

// =========================================================
// 5. INDEXES (Tối ưu tốc độ tìm kiếm)
// =========================================================
ProductSchema.index({ name: 'text', brand: 'text', description: 'text' }) // Tìm kiếm Full-text
// ProductSchema.index({ slug: 1 }) // Tìm theo slug nhanh
ProductSchema.index({ category: 1 }) // Lọc theo danh mục nhanh
ProductSchema.index({ price: 1 }) // Sắp xếp theo giá
ProductSchema.index({ createdAt: -1 }) // Sắp xếp mới nhất

// Ngăn lỗi OverwriteModelError trong Next.js (Hot Reload)
export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema)

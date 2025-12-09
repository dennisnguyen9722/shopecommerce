import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema(
  {
    // ⭐ Thêm product để reference đúng
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    // ⭐ THÊM MỚI: Lưu variantId nếu là biến thể
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false // Không bắt buộc vì có SP không có biến thể
    },

    name: String,
    quantity: Number,
    price: Number,
    image: String,
    slug: String,

    // ⭐ THÊM MỚI: Lưu thông tin biến thể đã chọn (để hiển thị)
    variantInfo: {
      sku: String,
      color: String,
      size: String,
      // Có thể thêm các options khác nếu cần
      options: {
        type: Map,
        of: String
      }
    }
  },
  { _id: false }
)

const OrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true
    },
    customerEmail: {
      type: String,
      required: true
    },
    customerPhone: {
      type: String,
      required: true
    },
    customerAddress: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true
    },
    items: {
      type: [OrderItemSchema],
      required: true
    },

    // ⭐ THÊM MỚI: Các field giá chi tiết
    subtotal: {
      type: Number,
      required: true
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true
    },

    // Voucher & Coupon
    voucherCode: {
      type: String,
      uppercase: true
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    },
    couponCode: {
      type: String,
      uppercase: true
    },

    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
      default: 'pending',
      required: true
    },

    // ⭐ THÊM MỚI: Order number để track
    orderNumber: {
      type: String,
      unique: true
    }
  },
  { timestamps: true }
)

// ⭐ Tự động tạo orderNumber trước khi save
OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`
  }
  next()
})

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)

export default Order

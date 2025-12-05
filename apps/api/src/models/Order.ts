import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    quantity: Number,
    price: Number,
    image: String,
    slug: String
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
    totalPrice: {
      type: Number,
      required: true
    },

    // ⚡ NEW: Lưu link đến coupon thật sự
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    },

    couponCode: {
      type: String,
      uppercase: true
    },

    couponDiscount: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
      default: 'pending',
      required: true
    }
  },
  { timestamps: true }
)

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)

export default Order

import mongoose, { Schema, Document, Model } from 'mongoose'

export type NotificationType =
  | 'order' // Đơn hàng mới, thanh toán, hủy...
  | 'inventory' // Sắp hết hàng, hết hàng
  | 'customer' // Đánh giá mới, khách đăng ký mới
  | 'system' // Thông báo hệ thống

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error'

export interface INotification extends Document {
  title: string
  message?: string
  type: NotificationType
  level: NotificationLevel
  isRead: boolean

  // Meta để sau này link tới order / product / customer nếu muốn
  meta?: {
    orderId?: mongoose.Types.ObjectId
    productId?: mongoose.Types.ObjectId
    customerId?: mongoose.Types.ObjectId
    link?: string
    [key: string]: any
  }

  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String },

    type: {
      type: String,
      enum: ['order', 'inventory', 'customer', 'system'],
      default: 'system',
      index: true
    },

    level: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info'
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    meta: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
)

// Một vài index hữu ích
NotificationSchema.index({ createdAt: -1 })
NotificationSchema.index({ type: 1, isRead: 1 })

export default (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>('Notification', NotificationSchema)

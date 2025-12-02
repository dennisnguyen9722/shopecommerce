import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  title: string
  message: string
  type: 'order' | 'info' | 'warning'
  isRead: boolean
  orderId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['order', 'info', 'warning'],
      default: 'info'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: false
    }
  },
  {
    timestamps: true
  }
)

// Index để query nhanh hơn
notificationSchema.index({ isRead: 1, createdAt: -1 })

export default mongoose.model<INotification>('Notification', notificationSchema)

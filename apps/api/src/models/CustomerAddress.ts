import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICustomerAddress extends Document {
  customer: mongoose.Types.ObjectId
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  ward: string // ⭐ Bắt buộc
  district: string // ⭐ Bắt buộc
  province: string // ⭐ Bắt buộc
  country: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    fullName: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên']
    },
    phone: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
      validate: {
        validator: function (v: string) {
          return /^[0-9]{10,11}$/.test(v.replace(/\s/g, ''))
        },
        message: 'Số điện thoại không hợp lệ'
      }
    },
    addressLine1: {
      type: String,
      required: [true, 'Vui lòng nhập địa chỉ cụ thể']
    },
    addressLine2: String,
    ward: {
      type: String,
      required: [true, 'Vui lòng chọn Phường/Xã']
    },
    district: {
      type: String,
      required: [true, 'Vui lòng chọn Quận/Huyện']
    },
    province: {
      type: String,
      required: [true, 'Vui lòng chọn Tỉnh/Thành']
    },
    country: {
      type: String,
      default: 'Vietnam'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

// Indexes
AddressSchema.index({ customer: 1, isDefault: 1 })

// ⭐ MIDDLEWARE: Set default logic
AddressSchema.pre('save', async function (next) {
  try {
    if (this.isDefault) {
      const AddressModel = this.constructor as Model<ICustomerAddress>
      await AddressModel.updateMany(
        {
          customer: this.customer,
          _id: { $ne: this._id }
        },
        { $set: { isDefault: false } }
      )
    }
    next()
  } catch (error) {
    next(error as Error)
  }
})

export default (mongoose.models.CustomerAddress as Model<ICustomerAddress>) ||
  mongoose.model<ICustomerAddress>('CustomerAddress', AddressSchema)

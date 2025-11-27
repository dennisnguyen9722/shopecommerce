import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: mongoose.Types.ObjectId | null
  address?: string
  avatar?: string

  matchPassword(enteredPassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    // 🔥 Sử dụng Role model mới
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      default: null // user mới vẫn không có role → vẫn login được → admin gán role sau
    },

    address: { type: String },
    avatar: { type: String }
  },
  { timestamps: true }
)

// 🔒 Hash mật khẩu trước khi lưu
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// 🧩 Hàm so sánh mật khẩu khi login
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

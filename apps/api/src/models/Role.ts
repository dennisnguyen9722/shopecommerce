import mongoose, { Schema, Document } from 'mongoose'

export interface IRole extends Document {
  name: string // ví dụ: "Manager", "Editor"
  description?: string // mô tả
  permissions: string[] // danh sách quyền
  isSystem: boolean // role hệ thống, không cho xóa/sửa
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema)

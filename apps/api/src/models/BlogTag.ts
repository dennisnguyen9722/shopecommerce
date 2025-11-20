import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBlogTag extends Document {
  name: string
  slug: string

  createdAt: Date
  updatedAt: Date
}

const BlogTagSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true }
  },
  { timestamps: true }
)

export default (mongoose.models.BlogTag as Model<IBlogTag>) ||
  mongoose.model<IBlogTag>('BlogTag', BlogTagSchema)

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBlogCategory extends Document {
  name: string
  slug: string
  parent?: mongoose.Types.ObjectId

  createdAt: Date
  updatedAt: Date
}

const BlogCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parent: { type: Schema.Types.ObjectId, ref: 'BlogCategory' }
  },
  { timestamps: true }
)

export default (mongoose.models.BlogCategory as Model<IBlogCategory>) ||
  mongoose.model<IBlogCategory>('BlogCategory', BlogCategorySchema)

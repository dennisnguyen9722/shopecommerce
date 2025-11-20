import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBlogPost extends Document {
  title: string
  slug: string
  excerpt?: string
  content: string
  thumbnailUrl?: string

  status: 'draft' | 'published' | 'archived'

  seoTitle?: string
  seoDescription?: string

  categories: mongoose.Types.ObjectId[]
  tags: mongoose.Types.ObjectId[]

  author?: mongoose.Types.ObjectId
  publishedAt?: Date

  createdAt: Date
  updatedAt: Date
}

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    thumbnailUrl: { type: String },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },

    seoTitle: { type: String },
    seoDescription: { type: String },

    categories: [{ type: Schema.Types.ObjectId, ref: 'BlogCategory' }],
    tags: [{ type: Schema.Types.ObjectId, ref: 'BlogTag' }],

    author: { type: Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date }
  },
  { timestamps: true }
)

export default (mongoose.models.BlogPost as Model<IBlogPost>) ||
  mongoose.model<IBlogPost>('BlogPost', BlogPostSchema)

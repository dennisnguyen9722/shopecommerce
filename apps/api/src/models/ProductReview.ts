import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProductReview extends Document {
  product: mongoose.Types.ObjectId
  customer: mongoose.Types.ObjectId
  order: mongoose.Types.ObjectId
  rating: number
  title: string
  comment: string
  images: string[]
  pros: string[]
  cons: string[]
  isVerifiedPurchase: boolean
  isApproved: boolean
  adminReply?: {
    message: string
    repliedBy: mongoose.Types.ObjectId
    repliedAt: Date
  }
  helpfulCount: number
  helpfulVotes: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

// Interface cho static methods
interface IProductReviewModel extends Model<IProductReview> {
  calculateAverageRating(productId: mongoose.Types.ObjectId): Promise<{
    averageRating: number
    totalReviews: number
    distribution: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  }>
}

const ProductReviewSchema = new Schema<IProductReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true
    },
    comment: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 5
        },
        message: 'Maximum 5 images allowed per review'
      }
    },
    pros: {
      type: [String],
      default: []
    },
    cons: {
      type: [String],
      default: []
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
      index: true
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true
    },
    adminReply: {
      message: {
        type: String,
        maxlength: 1000
      },
      repliedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      repliedAt: {
        type: Date
      }
    },
    helpfulCount: {
      type: Number,
      default: 0
    },
    helpfulVotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
      }
    ]
  },
  {
    timestamps: true
  }
)

// Index để đảm bảo 1 customer chỉ review 1 lần cho 1 order item
ProductReviewSchema.index(
  { product: 1, customer: 1, order: 1 },
  { unique: true }
)

// Index cho sorting
ProductReviewSchema.index({ createdAt: -1 })
ProductReviewSchema.index({ helpfulCount: -1 })

// Static method: Tính average rating cho product
ProductReviewSchema.statics.calculateAverageRating = async function (
  productId: mongoose.Types.ObjectId
) {
  const stats = await this.aggregate([
    {
      $match: {
        product: productId,
        isApproved: true
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ])

  if (stats.length > 0) {
    const distribution = stats[0].ratingDistribution.reduce(
      (acc: any, rating: number) => {
        acc[rating] = (acc[rating] || 0) + 1
        return acc
      },
      {}
    )

    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      distribution: {
        5: distribution[5] || 0,
        4: distribution[4] || 0,
        3: distribution[3] || 0,
        2: distribution[2] || 0,
        1: distribution[1] || 0
      }
    }
  }

  return {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  }
}

// Update Product rating khi review được approve
ProductReviewSchema.post('save', async function () {
  if (this.isApproved) {
    const Product = mongoose.model('Product')
    const ProductReviewModel = this.constructor as IProductReviewModel
    const stats = await ProductReviewModel.calculateAverageRating(this.product)

    await Product.findByIdAndUpdate(this.product, {
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      ratingDistribution: stats.distribution
    })
  }
})

// Update Product rating khi review bị xóa
ProductReviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc && doc.isApproved) {
    const Product = mongoose.model('Product')
    const ProductReviewModel = mongoose.model<
      IProductReview,
      IProductReviewModel
    >('ProductReview')
    const stats = await ProductReviewModel.calculateAverageRating(doc.product)

    await Product.findByIdAndUpdate(doc.product, {
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      ratingDistribution: stats.distribution
    })
  }
})

export default mongoose.model<IProductReview, IProductReviewModel>(
  'ProductReview',
  ProductReviewSchema
)

import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import PaymentMethod from '../models/PaymentMethod'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce'

async function seed() {
  console.log('🔌 Connecting to MongoDB...')
  await mongoose.connect(MONGO_URI)

  const defaultMethods = [
    {
      key: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      enabled: true,
      sortOrder: 0,
      config: {}
    },
    {
      key: 'bank',
      name: 'Chuyển khoản ngân hàng',
      enabled: false,
      sortOrder: 1,
      config: {
        bankName: '',
        accountName: '',
        accountNumber: '',
        branch: ''
      }
    },
    {
      key: 'momo',
      name: 'Thanh toán Ví MoMo',
      enabled: false,
      sortOrder: 2,
      config: {
        partnerCode: '',
        accessKey: '',
        secretKey: ''
      }
    },
    {
      key: 'stripe',
      name: 'Thanh toán bằng Stripe',
      enabled: false,
      sortOrder: 3,
      config: {
        publishableKey: '',
        secretKey: ''
      }
    }
  ]

  console.log('🚀 Seeding payment methods...')
  for (const m of defaultMethods) {
    await PaymentMethod.findOneAndUpdate({ key: m.key }, m, {
      upsert: true
    })
  }

  console.log('✅ Done!')
  process.exit(0)
}

seed()

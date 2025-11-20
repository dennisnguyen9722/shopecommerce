import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Order from './models/Order'

dotenv.config()

async function seed() {
  await mongoose.connect(process.env.MONGO_URI as string)

  await Order.deleteMany()

  await Order.insertMany([
    { total: 2350000, status: 'completed' },
    { total: 1200000, status: 'pending' },
    { total: 980000, status: 'processing' }
  ])

  console.log('✅ Seeded sample orders!')
  await mongoose.disconnect()
}

seed()

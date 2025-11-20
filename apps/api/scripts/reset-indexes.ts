// apps/api/scripts/reset-indexes.ts
import dotenv from 'dotenv'
dotenv.config({ path: __dirname + '/../.env' })

import mongoose from 'mongoose'
import Category from '../src/models/Category'
import Product from '../src/models/Product'

async function run() {
  const uri = process.env.MONGO_URI

  if (!uri) {
    console.error('❌ Missing MONGO_URI in .env')
    process.exit(1)
  }

  console.log('🔌 Connecting to MongoDB...')
  await mongoose.connect(uri)
  console.log('✅ Connected')

  console.log('\n📦 Dropping CATEGORY indexes...')
  try {
    await Category.collection.dropIndexes()
    console.log('   → Category indexes dropped')
  } catch (err: any) {
    console.log('   (skip) No category indexes found or already clean')
  }

  console.log('\n📦 Dropping PRODUCT indexes...')
  try {
    await Product.collection.dropIndexes()
    console.log('   → Product indexes dropped')
  } catch (err: any) {
    console.log('   (skip) No product indexes found or already clean')
  }

  console.log('\n🎉 Done! Restart API để Mongoose tạo index mới.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

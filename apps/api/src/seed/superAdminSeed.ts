// apps/api/src/seed/superAdminSeed.ts
import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import Role from '../models/Role'
import User from '../models/User'
import { ALL_PERMISSIONS } from '../constants/permissions'

async function run() {
  try {
    const MONGO_URI =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce'

    console.log('⏳ Connecting to MongoDB...')
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected!')

    // 1) tìm hoặc tạo role Super Admin
    let role = await Role.findOne({ name: 'Super Admin' })
    if (!role) {
      role = await Role.create({
        name: 'Super Admin',
        description: 'Full quyền hệ thống',
        permissions: ALL_PERMISSIONS,
        isSystem: true
      })
      console.log('🔥 Created Super Admin role:', role._id.toString())
    } else {
      console.log('ℹ️ Super Admin role already exists:', role._id.toString())
    }

    // 2) tìm user admin@example.com
    const admin = await User.findOne({ email: 'admin@example.com' })
    if (admin) {
      admin.role = role._id
      await admin.save()
      console.log('🎉 Assigned Super Admin role to:', admin.email)
    } else {
      console.log('⚠️ No admin@example.com user found — skipping assign')
    }

    await mongoose.disconnect()
    console.log('✅ Seed completed and MongoDB disconnected.')
    process.exit(0)
  } catch (err: any) {
    console.error('❌ Seed error:', err.message || err)
    process.exit(1)
  }
}

run()

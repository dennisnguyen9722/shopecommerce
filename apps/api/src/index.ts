import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import 'express-async-errors'

import http from 'http'
import { Server as SocketIOServer } from 'socket.io'

// ROUTES
import adminRoutes from './routes/admin'
import authRoutes from './routes/auth'

// ADMIN RESOURCES
import productsRoutes from './routes/products'
import brandRoutes from './routes/brands'
import categoriesRoutes from './routes/categories'
import stockLogsRoutes from './routes/stockLogs'
import analyticsRoutes from './routes/analytics'
import notificationsRoutes from './routes/notifications'
import inventoryRoutes from './routes/inventory'
import bannersRoutes from './routes/banners'
import posts from './routes/blog/posts'
import categories from './routes/blog/categories'
import tags from './routes/blog/tags'
import paymentMethodsRoutes from './routes/paymentMethods'
import shippingRulesRoutes from './routes/shippingRules'
import locationsRoutes from './routes/locations'
import uploadsRoutes from './routes/uploads'
import rolesRoutes from './routes/roles'
import usersRoutes from './routes/users'
import profileRoutes from './routes/profile'
import metricsRoutes from './routes/metrics'
import customerAuthRoutes from './routes/customerAuth'
import customersRoutes from './routes/customers'

// 🔥 NEW - ADMIN ORDERS API
import ordersRouter from './routes/admin/orders'
import couponRoutes from './routes/admin/coupons'

// 🆕 NEW - LOYALTY SYSTEM (ADMIN)
import adminRewardsRoutes from './routes/admin/rewards'
import adminPointsRoutes from './routes/admin/points'

import adminReviewsRoutes from './routes/admin/reviews'

import exportRoutes from './routes/admin/export'

import { seedSuperAdmin } from './seed/superAdminSeed'

// PUBLIC STORE FRONT
import publicBanners from './routes/public/banners'
import publicCategories from './routes/public/categories'
import publicProducts from './routes/public/products'
import publicBrands from './routes/public/brands'
import publicBlog from './routes/public/blog'
import publicOrders from './routes/public/orders'
import publicCoupons from './routes/public/coupons'
import publicPostsRouter from './routes/public/posts'
import publicBlogCategoriesRouter from './routes/public/blog-categories'
import provincesRoutes from './routes/public/provinces'

import publicAuthRoutes from './routes/public/auth'
import publicProfileRouter from './routes/public/profile'

// 🆕 NEW - LOYALTY SYSTEM (PUBLIC)
import publicLoyaltyRoutes from './routes/public/loyalty'

import publicReviews from './routes/public/reviews'

// MIDDLEWARE
import { errorHandler } from './middleware/errorHandler'
import { log } from './utils/logger'

/* ----------------------------
   EXPRESS APP
----------------------------- */
const app = express()

// 👇 CẬP NHẬT CORS: Cho phép Frontend trên Render và Localhost
const allowedOrigins = [
  process.env.FRONTEND_URL, // Link Vercel (sau này)
  'http://localhost:3000', // Localhost Frontend
  'http://localhost:4000' // Localhost API (nếu tự gọi chính nó)
]

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép requests không có origin (như Postman, mobile apps, curl)
      if (!origin) return callback(null, true)

      if (
        allowedOrigins.indexOf(origin) === -1 &&
        !origin.includes('vercel.app')
      ) {
        // Tạm thời cho phép tất cả đuôi .vercel.app để deploy cho dễ
        // Sau này muốn chặt chẽ thì bỏ cái !origin.includes('vercel.app') đi
        return callback(null, true)
      }
      return callback(null, true)
    },
    credentials: true
  })
)

app.use(express.json())

/* ----------------------------
   HTTP + SOCKET SERVER
----------------------------- */
const server = http.createServer(app)

// Cấu hình CORS cho Socket.io luôn
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Tạm thời để * cho socket dễ kết nối
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  log.info('🔌 Admin connected: ' + socket.id)
})

/* ----------------------------
   ROUTES
----------------------------- */

// BASE ADMIN AUTH
app.use('/admin', adminRoutes)
app.use('/auth', authRoutes)

// ADMIN RESOURCES
app.use('/admin/products', productsRoutes)
app.use('/admin/brands', brandRoutes)
app.use('/admin/categories', categoriesRoutes)
app.use('/admin/inventory', inventoryRoutes)
app.use('/admin/stock-logs', stockLogsRoutes)
app.use('/admin/customers', customersRoutes)
app.use('/analytics', analyticsRoutes)
app.use('/admin/analytics', analyticsRoutes)
app.use('/admin/banners', bannersRoutes)
app.use('/admin/payment-methods', paymentMethodsRoutes)
app.use('/admin/roles', rolesRoutes)
app.use('/admin/users', usersRoutes)
app.use('/admin/shipping-rules', shippingRulesRoutes)
app.use('/admin/locations', locationsRoutes)
app.use('/admin/notifications', notificationsRoutes)
app.use('/admin/profile', profileRoutes)
app.use('/admin/metrics', metricsRoutes)

// ⭐ NEW: ADMIN ORDERS
app.use('/admin/orders', ordersRouter)
app.use('/admin/coupons', couponRoutes)

// 🆕 NEW: ADMIN LOYALTY SYSTEM
app.use('/admin/rewards', adminRewardsRoutes)
app.use('/admin/points', adminPointsRoutes)

app.use('/admin/reviews', adminReviewsRoutes)

// BLOG MODULE
app.use('/admin/blog/posts', posts)
app.use('/admin/blog/categories', categories)
app.use('/admin/blog/tags', tags)

app.use('/admin/export', exportRoutes)

// UPLOAD ROUTES
app.use('/uploads', uploadsRoutes)

// PUBLIC API ROUTES
app.use('/public/banners', publicBanners)
app.use('/public/categories', publicCategories)
app.use('/public/products', publicProducts)
app.use('/public/brands', publicBrands)
app.use('/public/blog', publicBlog)
app.use('/public/orders', publicOrders)
app.use('/public/coupons', publicCoupons)
app.use('/public/customer-auth', customerAuthRoutes)
app.use('/public/profile', publicProfileRouter)
app.use('/public/auth', publicAuthRoutes)
app.use('/public/posts', publicPostsRouter)
app.use('/public/blog-categories', publicBlogCategoriesRouter)
app.use('/public', provincesRoutes)

// 🆕 NEW: PUBLIC LOYALTY SYSTEM
app.use('/public/loyalty', publicLoyaltyRoutes)
app.use('/public/reviews', publicReviews)

/* ----------------------------
   ERROR HANDLER
----------------------------- */
app.use(errorHandler)

/* ----------------------------
   DATABASE + START SERVER
----------------------------- */
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce'

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    log.info('📦 MongoDB connected')

    await seedSuperAdmin()

    // 👇 QUAN TRỌNG: Lấy PORT từ biến môi trường (Render cấp), nếu không có mới dùng 4000
    const PORT = process.env.PORT || 4000

    server.listen(PORT, () =>
      log.info(`🚀 API running + Socket.IO on port ${PORT}`)
    )
  })
  .catch((err) => log.error('MongoDB error: ' + err.message))

export default app

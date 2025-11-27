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
import productsRoutes from './routes/products'
import categoriesRoutes from './routes/categories'
import stockLogsRoutes from './routes/stockLogs'
import customersRoutes from './routes/customers'
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

// MIDDLEWARE
import { errorHandler } from './middleware/errorHandler'
import { log } from './utils/logger'

/* ----------------------------
   EXPRESS APP
----------------------------- */
const app = express()
app.use(cors())
app.use(express.json())

/* ----------------------------
   HTTP + SOCKET SERVER
----------------------------- */
const server = http.createServer(app)

export const io = new SocketIOServer(server, {
  cors: { origin: '*' }
})

io.on('connection', (socket) => {
  log.info('🔌 Admin connected: ' + socket.id)
})

/* ----------------------------
   ROUTES
----------------------------- */
app.use('/admin', adminRoutes)
app.use('/auth', authRoutes)

// ADMIN RESOURCES
app.use('/admin/products', productsRoutes)
app.use('/admin/categories', categoriesRoutes)
app.use('/admin/inventory', inventoryRoutes)
app.use('/admin/stock-logs', stockLogsRoutes)
app.use('/admin/customers', customersRoutes)
app.use('/admin/analytics', analyticsRoutes)
app.use('/admin/banners', bannersRoutes)
app.use('/admin/payment-methods', paymentMethodsRoutes)
app.use('/admin/roles', rolesRoutes)
app.use('/admin/users', usersRoutes)
app.use('/admin/shipping-rules', shippingRulesRoutes)
app.use('/admin/locations', locationsRoutes)
app.use('/admin/notifications', notificationsRoutes)
app.use('/admin/profile', profileRoutes)

// BLOG MODULE
app.use('/admin/blog/posts', posts)
app.use('/admin/blog/categories', categories)
app.use('/admin/blog/tags', tags)

// UPLOAD ROUTES
app.use('/uploads', uploadsRoutes)

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
  .then(() => {
    log.info('📦 MongoDB connected')
    server.listen(4000, () =>
      log.info('🚀 API running + Socket.IO on http://localhost:4000')
    )
  })
  .catch((err) => log.error('MongoDB error: ' + err.message))

export default app

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

describe('MongoDB Connection', () => {
  it('should connect successfully', async () => {
    await mongoose.connect(process.env.MONGO_URI as string)
    expect(mongoose.connection.readyState).toBe(1)
    await mongoose.disconnect()
  })
})

afterAll(async () => {
  await mongoose.disconnect()
})

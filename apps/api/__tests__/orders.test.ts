jest.mock('mongoose')
jest.mock('../src/utils/sendEmail', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}))
import request from 'supertest'
import app from '../src/index' // hoặc nơi bạn export express()

describe('Order API', () => {
  it('PATCH /admin/orders/:id/status should return updated order', async () => {
    const res = await request(app)
      .patch('/admin/orders/675a67e6e7a8bd00018d30b5/status')
      .send({ status: 'completed' })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('status', 'completed')
  })
})

import * as orderService from '../src/services/orderService'
import * as emailService from '../src/services/emailService'

jest.mock('../src/services/emailService', () => ({
  sendInvoiceEmail: jest.fn().mockResolvedValue(true)
}))

jest.mock('../src/models/Order', () => ({
  findByIdAndUpdate: jest.fn().mockReturnValue({
    lean: () => ({
      _id: '8888888',
      status: 'completed',
      total: 350000
    })
  })
}))

jest.mock('../src/models/User', () => ({
  findOne: jest.fn().mockReturnValue({
    lean: () => ({ name: 'Dennis', email: 'test@example.com' })
  })
}))

describe('Order Service', () => {
  it('should send invoice when order completed', async () => {
    await orderService.updateOrderStatus('8888888', 'completed')
    expect(emailService.sendInvoiceEmail).toHaveBeenCalledTimes(1)
  })

  it('should not send email for pending', async () => {
    await orderService.updateOrderStatus('8888888', 'pending')
    expect(emailService.sendInvoiceEmail).toHaveBeenCalledTimes(1) // vẫn chỉ 1 lần
  })
})

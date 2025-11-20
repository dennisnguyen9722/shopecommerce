jest.mock('../src/utils/sendEmail', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}))
import * as emailService from '../src/services/emailService'
import * as sendEmailUtil from '../src/utils/sendEmail'

describe('Email Service', () => {
  it('should call sendEmail with attachment', async () => {
    const order = {
      _id: '9999999',
      customer: { name: 'Dennis', email: 'test@example.com' },
      items: [{ name: 'Áo thun', quantity: 1, price: 100000 }]
    }

    await emailService.sendInvoiceEmail(order)
    expect(sendEmailUtil.sendEmail).toHaveBeenCalledTimes(1)
    const callArgs = (sendEmailUtil.sendEmail as jest.Mock).mock.calls[0][0]
    expect(callArgs.attachments[0].filename).toContain('invoice')
  })
})

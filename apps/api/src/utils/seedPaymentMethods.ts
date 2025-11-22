import PaymentMethod from '../models/PaymentMethod'

export const seedPaymentMethods = async () => {
  const defaults = [
    {
      key: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      enabled: true,
      sortOrder: 1,
      config: {}
    },
    {
      key: 'bank',
      name: 'Chuyển khoản ngân hàng',
      enabled: false,
      sortOrder: 2,
      config: {
        bankName: '',
        accountName: '',
        accountNumber: '',
        branch: ''
      }
    },
    {
      key: 'stripe',
      name: 'Stripe',
      enabled: false,
      sortOrder: 3,
      config: {
        publishableKey: '',
        secretKey: ''
      }
    },
    {
      key: 'momo',
      name: 'Momo',
      enabled: false,
      sortOrder: 4,
      config: {
        partnerCode: '',
        accessKey: '',
        secretKey: ''
      }
    }
  ]

  for (const item of defaults) {
    const exists = await PaymentMethod.findOne({ key: item.key })
    if (!exists) {
      await PaymentMethod.create(item)
      console.log(`Seeded payment method: ${item.key}`)
    }
  }
}

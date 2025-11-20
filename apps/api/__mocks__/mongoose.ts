export const Schema = function (definition: any) {
  return definition
}

export const model = jest.fn().mockReturnValue({
  find: jest.fn().mockResolvedValue([]),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue({
    _id: 'mock-order-id',
    total: 100000,
    status: 'completed'
  }),
  // ✅ thêm findOne() mock
  findOne: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue({
      name: 'Dennis Tester',
      email: 'test@example.com',
      address: 'HCM City'
    })
  })
})

export const models: Record<string, any> = {}

export default {
  Schema,
  model,
  models,
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  connection: { readyState: 1 }
}

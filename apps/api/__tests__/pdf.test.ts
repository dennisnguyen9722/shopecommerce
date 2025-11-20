import { renderToBuffer } from '@react-pdf/renderer'
import { createInvoiceDocument } from '../src/services/pdfService'

describe('PDF Service', () => {
  it('should render a PDF buffer', async () => {
    const order = {
      _id: '123456789',
      customer: { name: 'Dennis', email: 'test@example.com', address: 'HCM' },
      items: [
        { name: 'Áo thun', quantity: 2, price: 200000 },
        { name: 'Quần kaki', quantity: 1, price: 400000 }
      ]
    }

    const pdfBuffer = await renderToBuffer(createInvoiceDocument(order))
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.length).toBeGreaterThan(10) // ✅ vì mock trả 13 bytes
  })
})

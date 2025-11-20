import { renderToStream } from '@react-pdf/renderer'
import { Buffer } from 'buffer'
import { sendEmail } from '../utils/sendEmail'
import { createInvoiceDocument } from './pdfService'

export async function sendInvoiceEmail(orderData: any) {
  const pdfStream = await renderToStream(createInvoiceDocument(orderData))
  const chunks: Buffer[] = []

  return new Promise<void>((resolve, reject) => {
    pdfStream.on('data', (chunk) => chunks.push(chunk))
    pdfStream.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks)
      try {
        await sendEmail({
          to: orderData.customer.email,
          subject: `Hóa đơn đơn hàng #${orderData._id?.toString().slice(-5)}`,
          html: `<p>Xin chào <b>${orderData.customer.name}</b>,<br/>
          Cảm ơn bạn đã mua hàng tại <b>Dennis Shop</b>!<br/>
          Vui lòng xem hóa đơn đính kèm.</p>`,
          attachments: [
            {
              filename: `invoice_${orderData._id?.toString()}.pdf`,
              content: pdfBuffer
            }
          ]
        })
        resolve()
      } catch (err) {
        reject(err)
      }
    })
    pdfStream.on('error', reject)
  })
}

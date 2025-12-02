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
          to: orderData.customerEmail, // ✅ DÙNG EMAIL TỪ ORDER
          subject: `Hóa đơn đơn hàng #${orderData._id?.toString().slice(-5)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Dennis Shop - Hóa đơn đơn hàng</h2>
              <p>Xin chào <strong>${orderData.customerName}</strong>,</p>
              <p>Cảm ơn bạn đã mua hàng tại <strong>Dennis Shop</strong>!</p>
              <p>Đơn hàng của bạn đã được hoàn thành. Vui lòng xem hóa đơn đính kèm.</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Mã đơn hàng: <strong>#${orderData._id
                  ?.toString()
                  .slice(-8)}</strong><br>
                Tổng thanh toán: <strong style="color: #f97316;">${orderData.totalPrice?.toLocaleString(
                  'vi-VN'
                )}₫</strong>
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Email này được gửi tự động, vui lòng không trả lời.<br>
                Nếu có thắc mắc, liên hệ: support@dennisshop.com
              </p>
            </div>
          `,
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

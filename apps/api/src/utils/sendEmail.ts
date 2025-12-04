import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments
}: {
  to: string
  subject: string
  text?: string
  html?: string
  attachments?: any[]
}) {
  // ✅ Kiểm tra test mode TRƯỚC khi gửi
  if (process.env.NODE_ENV === 'test') {
    console.log('📧 Skipping real email send (test mode)')
    return Promise.resolve(true)
  }

  // ✅ Gửi email thật
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER, // Fallback nếu không có EMAIL_FROM
      to,
      subject,
      text,
      html,
      attachments
    })

    console.log('📧 ✅ Email sent successfully:', info.messageId)
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info))

    return info
  } catch (error: any) {
    console.error('❌ Error sending email:', error.message)
    throw error // Throw để caller biết có lỗi
  }
}

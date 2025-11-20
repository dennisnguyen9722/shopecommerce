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
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
    attachments
  })
  if (process.env.NODE_ENV === 'test') {
    console.log('📧 Skipping real email send (test mode)')
    return Promise.resolve(true)
  }
}

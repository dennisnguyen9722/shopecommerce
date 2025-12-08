'use client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import { InvoiceDocument } from './InvoicePDF'

interface InvoicePDFClientProps {
  order: any
  variant?: 'default' | 'customer'
  className?: string
}

export default function InvoicePDFClient({
  order,
  variant = 'default',
  className = ''
}: InvoicePDFClientProps) {
  if (!order) return null

  return (
    <PDFDownloadLink
      document={<InvoiceDocument order={order} />}
      fileName={`invoice_${order._id}.pdf`}
    >
      {({ loading }) =>
        variant === 'customer' ? (
          // 🎨 Button cho customer page - màu cam matching với website
          <button
            className={`w-full py-3 px-6 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 active:bg-orange-800 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${className}`}
            disabled={loading}
          >
            <FileDown className="w-5 h-5" />
            {loading ? 'Đang tạo...' : 'Xuất hóa đơn PDF'}
          </button>
        ) : (
          // 🎨 Button cho admin dashboard - giữ nguyên style cũ
          <Button
            variant="default"
            className={`gap-2 bg-primary text-white hover:bg-primary/90 ${className}`}
            disabled={loading}
          >
            <FileDown className="w-4 h-4" />
            {loading ? 'Đang tạo...' : 'Xuất hóa đơn PDF'}
          </Button>
        )
      }
    </PDFDownloadLink>
  )
}

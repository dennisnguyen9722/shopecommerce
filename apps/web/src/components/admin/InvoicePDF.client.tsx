'use client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import { InvoiceDocument } from './InvoicePDF'

export default function InvoicePDFClient({ order }: { order: any }) {
  if (!order) return null
  return (
    <PDFDownloadLink
      document={<InvoiceDocument order={order} />}
      fileName={`invoice_${order._id}.pdf`}
    >
      {({ loading }) => (
        <Button
          variant="default"
          className="gap-2 bg-primary text-white hover:bg-primary/90"
        >
          <FileDown className="w-4 h-4" />
          {loading ? 'Đang tạo...' : 'Xuất hóa đơn PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}

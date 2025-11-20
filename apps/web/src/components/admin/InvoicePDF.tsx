'use client'
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font
} from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

Font.register({
  family: 'Inter',
  fonts: [
    {
      src: '/fonts/Inter-Regular.ttf',
      fontWeight: 'normal'
    },
    {
      src: '/fonts/Inter-Bold.ttf',
      fontWeight: 'bold'
    }
  ]
})

// 🎨 Styles cho PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Inter'
  },
  header: {
    borderBottom: '1pt solid #ccc',
    marginBottom: 10,
    paddingBottom: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111'
  },
  section: {
    marginBottom: 10
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 2
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1pt solid #ccc',
    fontWeight: 'bold',
    paddingBottom: 4
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #eee',
    paddingVertical: 4
  },
  cell: { flex: 1 },
  total: {
    textAlign: 'right',
    fontWeight: 'bold',
    marginTop: 8
  }
})

export function InvoiceDocument({ order }: { order: any }) {
  const total =
    order.items?.reduce(
      (sum: number, i: any) => sum + i.price * i.quantity,
      0
    ) || 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>HÓA ĐƠN BÁN HÀNG</Text>
          <Text>Mã đơn: #{order._id.slice(-5)}</Text>
          <Text>
            Ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Khách hàng:</Text>
          <Text>{order.customer?.name}</Text>
          <Text>{order.customer?.email}</Text>
          <Text>{order.customer?.address}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Danh sách sản phẩm:</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.cell, { flex: 2 }]}>Tên</Text>
            <Text style={styles.cell}>SL</Text>
            <Text style={styles.cell}>Giá</Text>
            <Text style={styles.cell}>Tổng</Text>
          </View>

          {order.items?.map((item: any, i: number) => (
            <View style={styles.tableRow} key={i}>
              <Text style={[styles.cell, { flex: 2 }]}>{item.name}</Text>
              <Text style={styles.cell}>{item.quantity}</Text>
              <Text style={styles.cell}>
                {item.price.toLocaleString('vi-VN')}₫
              </Text>
              <Text style={styles.cell}>
                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.total}>
          Tổng cộng: {total.toLocaleString('vi-VN')}₫
        </Text>

        <View style={[styles.section, { marginTop: 20 }]}>
          <Text>Cảm ơn quý khách đã mua hàng tại Shop của Dennis ❤️</Text>
        </View>
      </Page>
    </Document>
  )
}

export default function InvoicePDF({ order }: { order: any }) {
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

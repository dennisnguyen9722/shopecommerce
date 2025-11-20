import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer'

// Đăng ký font Inter
Font.register({
  family: 'Inter',
  src: 'https://cdn.jsdelivr.net/gh/google/fonts/ofl/inter/Inter-Regular.ttf'
})

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Inter', fontSize: 12 },
  header: {
    borderBottom: '1pt solid #ccc',
    marginBottom: 12,
    paddingBottom: 8
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 100, fontWeight: 'bold' }
})

export const InvoiceDocument = ({ order }: { order: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>
          HÓA ĐƠN MUA HÀNG #{order._id.slice(-5)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Khách hàng:</Text>
        <Text>{order.customer?.name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Email:</Text>
        <Text>{order.customer?.email}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Địa chỉ:</Text>
        <Text>{order.customer?.address}</Text>
      </View>

      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Sản phẩm:</Text>
      {order.items.map((i: any, idx: number) => (
        <View key={idx} style={styles.row}>
          <Text>
            • {i.name} ({i.quantity}x):{' '}
            {(i.price * i.quantity).toLocaleString('vi-VN')}₫
          </Text>
        </View>
      ))}

      <Text style={{ marginTop: 12, fontWeight: 'bold' }}>
        Tổng cộng:{' '}
        {order.items
          .reduce((sum: number, i: any) => sum + i.price * i.quantity, 0)
          .toLocaleString('vi-VN')}
        ₫
      </Text>

      <Text style={{ marginTop: 20 }}>
        Cảm ơn bạn đã mua hàng tại Dennis Shop ❤️
      </Text>
    </Page>
  </Document>
)

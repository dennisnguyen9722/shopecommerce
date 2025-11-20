import React from 'react'
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font
} from '@react-pdf/renderer'

// Đăng ký font chữ
Font.register({
  family: 'Inter',
  src: 'https://cdn.jsdelivr.net/gh/google/fonts/ofl/inter/Inter-Regular.ttf'
})

// Định nghĩa style
const pdfStyles = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Inter', fontSize: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 100, fontWeight: 'bold' }
})

// ✅ Không dùng JSX nữa
export function createInvoiceDocument(order: any) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: pdfStyles.page },
      React.createElement(
        Text,
        { style: pdfStyles.title },
        `HÓA ĐƠN MUA HÀNG #${order._id?.slice(-5) || ''}`
      ),

      React.createElement(
        View,
        { style: pdfStyles.row },
        React.createElement(Text, { style: pdfStyles.label }, 'Khách hàng:'),
        React.createElement(Text, null, order.customer?.name || '')
      ),

      React.createElement(
        View,
        { style: pdfStyles.row },
        React.createElement(Text, { style: pdfStyles.label }, 'Email:'),
        React.createElement(Text, null, order.customer?.email || '')
      ),

      React.createElement(
        View,
        { style: pdfStyles.row },
        React.createElement(Text, { style: pdfStyles.label }, 'Địa chỉ:'),
        React.createElement(Text, null, order.customer?.address || '')
      ),

      React.createElement(
        Text,
        { style: { marginTop: 10, fontWeight: 'bold' } },
        'Sản phẩm:'
      ),

      ...(order.items || []).map((i: any, idx: number) =>
        React.createElement(
          View,
          { key: idx, style: pdfStyles.row },
          React.createElement(
            Text,
            null,
            `• ${i.name} (${i.quantity}x): ${(
              i.price * i.quantity
            ).toLocaleString('vi-VN')}₫`
          )
        )
      ),

      React.createElement(
        Text,
        { style: { marginTop: 12, fontWeight: 'bold' } },
        `Tổng cộng: ${(
          order.items?.reduce(
            (sum: number, i: any) => sum + i.price * i.quantity,
            0
          ) || 0
        ).toLocaleString('vi-VN')}₫`
      ),

      React.createElement(
        Text,
        { style: { marginTop: 20 } },
        'Cảm ơn bạn đã mua hàng tại Dennis Shop ❤️'
      )
    )
  )
}

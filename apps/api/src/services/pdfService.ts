import React from 'react'
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font
} from '@react-pdf/renderer'

// ✅ Đổi sang font Roboto - hỗ trợ tốt tiếng Việt
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700
    }
  ]
})

const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto', // ✅ Đổi thành Roboto
    fontSize: 11,
    lineHeight: 1.6
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2 solid #333'
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 5,
    color: '#f97316'
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 15
  },
  section: {
    marginBottom: 15
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6
  },
  label: {
    width: 120,
    fontWeight: 700,
    fontSize: 10,
    color: '#555'
  },
  value: {
    flex: 1,
    fontSize: 10
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: '1 solid #ddd'
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottom: '1 solid #f0f0f0'
  },
  itemName: {
    flex: 1,
    fontSize: 10
  },
  itemQty: {
    width: 60,
    textAlign: 'center',
    fontSize: 10
  },
  itemPrice: {
    width: 100,
    textAlign: 'right',
    fontSize: 10
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: '2 solid #333',
    alignItems: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 250,
    marginBottom: 5
  },
  totalLabel: {
    fontSize: 11,
    color: '#555'
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 700
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 250,
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1 solid #333'
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 700
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#f97316'
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1 solid #eee',
    textAlign: 'center',
    fontSize: 9,
    color: '#888'
  }
})

export function createInvoiceDocument(order: any) {
  const {
    _id,
    customerName,
    customerPhone,
    customerAddress,
    items = [],
    totalPrice = 0,
    createdAt,
    paymentMethod
  } = order

  const orderDate = createdAt
    ? new Date(createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString('vi-VN')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫'
  }

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: pdfStyles.page },

      // Header
      React.createElement(
        View,
        { style: pdfStyles.header },
        React.createElement(
          Text,
          { style: pdfStyles.title },
          'HÓA ĐƠN BÁN HÀNG'
        ),
        React.createElement(
          Text,
          { style: pdfStyles.subtitle },
          'Dennis Shop - Thời trang chất lượng cao'
        )
      ),

      // Order Info
      React.createElement(
        View,
        { style: pdfStyles.section },
        React.createElement(
          View,
          { style: pdfStyles.row },
          React.createElement(Text, { style: pdfStyles.label }, 'Mã đơn hàng:'),
          React.createElement(
            Text,
            { style: pdfStyles.value },
            `#${_id?.toString().slice(-8) || 'N/A'}`
          )
        ),
        React.createElement(
          View,
          { style: pdfStyles.row },
          React.createElement(Text, { style: pdfStyles.label }, 'Ngày đặt:'),
          React.createElement(Text, { style: pdfStyles.value }, orderDate)
        ),
        React.createElement(
          View,
          { style: pdfStyles.row },
          React.createElement(Text, { style: pdfStyles.label }, 'Thanh toán:'),
          React.createElement(
            Text,
            { style: pdfStyles.value },
            paymentMethod === 'cod' ? 'Tiền mặt (COD)' : paymentMethod || 'N/A'
          )
        )
      ),

      // Customer Info
      React.createElement(
        View,
        { style: pdfStyles.section },
        React.createElement(
          Text,
          { style: { fontSize: 11, fontWeight: 700, marginBottom: 8 } },
          'Thông tin khách hàng'
        ),
        React.createElement(
          View,
          { style: pdfStyles.row },
          React.createElement(Text, { style: pdfStyles.label }, 'Họ tên:'),
          React.createElement(
            Text,
            { style: pdfStyles.value },
            customerName || 'N/A'
          )
        ),
        React.createElement(
          View,
          { style: pdfStyles.row },
          React.createElement(
            Text,
            { style: pdfStyles.label },
            'Số điện thoại:'
          ),
          React.createElement(
            Text,
            { style: pdfStyles.value },
            customerPhone || 'N/A'
          )
        ),
        React.createElement(
          View,
          { style: pdfStyles.row },
          React.createElement(Text, { style: pdfStyles.label }, 'Địa chỉ:'),
          React.createElement(
            Text,
            { style: pdfStyles.value },
            customerAddress || 'N/A'
          )
        )
      ),

      // Items
      React.createElement(
        Text,
        { style: pdfStyles.itemsTitle },
        'Sản phẩm đã đặt'
      ),

      ...items.map((item: any, idx: number) =>
        React.createElement(
          View,
          { key: idx, style: pdfStyles.itemRow },
          React.createElement(
            Text,
            { style: pdfStyles.itemName },
            `${idx + 1}. ${item.name || 'N/A'}`
          ),
          React.createElement(
            Text,
            { style: pdfStyles.itemQty },
            `SL: ${item.quantity || 0}`
          ),
          React.createElement(
            Text,
            { style: pdfStyles.itemPrice },
            formatCurrency((item.price || 0) * (item.quantity || 0))
          )
        )
      ),

      // Totals
      React.createElement(
        View,
        { style: pdfStyles.totalSection },
        React.createElement(
          View,
          { style: pdfStyles.totalRow },
          React.createElement(
            Text,
            { style: pdfStyles.totalLabel },
            'Tạm tính:'
          ),
          React.createElement(
            Text,
            { style: pdfStyles.totalValue },
            formatCurrency(totalPrice)
          )
        ),
        React.createElement(
          View,
          { style: pdfStyles.totalRow },
          React.createElement(
            Text,
            { style: pdfStyles.totalLabel },
            'Vận chuyển:'
          ),
          React.createElement(Text, { style: pdfStyles.totalValue }, 'Miễn phí')
        ),
        React.createElement(
          View,
          { style: pdfStyles.grandTotal },
          React.createElement(
            Text,
            { style: pdfStyles.grandTotalLabel },
            'Tổng thanh toán:'
          ),
          React.createElement(
            Text,
            { style: pdfStyles.grandTotalValue },
            formatCurrency(totalPrice)
          )
        )
      ),

      // Footer
      React.createElement(
        View,
        { style: pdfStyles.footer },
        React.createElement(
          Text,
          null,
          'Cảm ơn quý khách đã mua hàng tại Dennis Shop!'
        ),
        React.createElement(
          Text,
          { style: { marginTop: 5 } },
          'Hotline: 1900-xxxx | Email: support@dennisshop.com'
        )
      )
    )
  )
}

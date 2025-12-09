'use client'

import { useEffect, useRef } from 'react'
import socket from '@/src/lib/socket'

type StockUpdateData = {
  productId: string
  variantId: string | null
  newStock: number
  type: 'product' | 'variant'
}

type UseRealtimeStockParams = {
  productId: string
  activeVariantId?: string | null
  onStockUpdate: (data: StockUpdateData) => void
  enabled?: boolean
}

export function useRealtimeStock({
  productId,
  activeVariantId,
  onStockUpdate,
  enabled = true
}: UseRealtimeStockParams) {
  // 1️⃣ Dùng useRef để lưu callback mới nhất
  // Giúp useEffect không bị chạy lại khi hàm onStockUpdate thay đổi
  const savedCallback = useRef(onStockUpdate)

  // Cập nhật ref mỗi khi onStockUpdate thay đổi
  useEffect(() => {
    savedCallback.current = onStockUpdate
  }, [onStockUpdate])

  useEffect(() => {
    // Nếu không có socket hoặc bị disable hoặc không có ID thì thôi
    if (!socket || !enabled || !productId) return

    const handleStockUpdate = (data: StockUpdateData) => {
      // console.log('📡 [Stock Update] Received Raw:', data)

      // Chỉ xử lý nếu đúng là sản phẩm này
      if (data.productId !== productId) return

      // Logic kiểm tra variant cũ của bạn
      if (
        data.type === 'variant' &&
        activeVariantId &&
        data.variantId !== activeVariantId
      ) {
        // console.log('📡 [Stock Update] Variant mismatch, ignoring')
        return
      }

      console.log('✅ [Stock Update] Applying:', data.newStock)

      // Gọi hàm từ ref (luôn là phiên bản mới nhất)
      if (savedCallback.current) {
        savedCallback.current(data)
      }
    }

    // Lắng nghe sự kiện
    socket.on('product:stock-updated', handleStockUpdate)

    // Chỉ log 1 lần khi bắt đầu lắng nghe để debug cho gọn
    console.log(`🔌 [Stock] Listening for product: ${productId}`)

    // Cleanup
    return () => {
      socket.off('product:stock-updated', handleStockUpdate)
      console.log(`🔌 [Stock] Stopped listening for: ${productId}`)
    }

    // 2️⃣ QUAN TRỌNG: Bỏ 'onStockUpdate' ra khỏi dependency array
    // Bây giờ hook chỉ chạy lại khi productId hoặc activeVariantId thay đổi thôi
  }, [productId, activeVariantId, enabled])
}

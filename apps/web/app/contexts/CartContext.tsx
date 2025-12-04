/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner' // Hoặc thư viện toast bạn đang dùng

// 1. CẬP NHẬT TYPE CART ITEM
export type CartItem = {
  _id: string
  name: string
  slug: string
  price: number
  image?: string
  quantity: number
  // 👇 THÊM 2 DÒNG NÀY
  variantId?: string
  variantName?: string
}

type CartContextType = {
  cart: CartItem[]
  cartCount: number
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, variantId?: string) => void // Cập nhật signature
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => void // Cập nhật signature
  clearCart: () => void
  cartTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage
  useEffect(() => {
    setMounted(true)
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error('Lỗi parse cart', e)
      }
    }
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }, [cart, mounted])

  // 2. LOGIC THÊM GIỎ HÀNG (CÓ HỖ TRỢ BIẾN THỂ)
  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      // Tìm xem sản phẩm đã tồn tại chưa
      // Phải check cả ID sản phẩm VÀ ID biến thể
      const existingItem = prev.find(
        (item) =>
          item._id === newItem._id && item.variantId === newItem.variantId
      )

      if (existingItem) {
        // Nếu có rồi -> Tăng số lượng
        return prev.map((item) =>
          item._id === newItem._id && item.variantId === newItem.variantId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }

      // Nếu chưa có -> Thêm mới
      return [...prev, newItem]
    })

    // Toast thông báo (Tuỳ chọn)
    // toast.success('Đã thêm vào giỏ hàng')
  }

  // 3. XÓA SẢN PHẨM (CẦN VARIANT ID ĐỂ XÓA ĐÚNG DÒNG)
  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        // Giữ lại item nếu ID khác HOẶC variantId khác
        return !(item._id === productId && item.variantId === variantId)
      })
    )
  }

  // 4. CẬP NHẬT SỐ LƯỢNG (CẦN VARIANT ID)
  const updateQuantity = (
    productId: string,
    quantity: number,
    variantId?: string
  ) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === productId && item.variantId === variantId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    )
  }

  const clearCart = () => setCart([])

  // Tính tổng tiền
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  // Tính tổng số lượng item (cho Badge trên Header)
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

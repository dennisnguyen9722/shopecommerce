/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

// ⭐ CẬP NHẬT: Thêm đầy đủ thông tin variant
export type CartItem = {
  _id: string
  name: string
  slug: string
  price: number
  image?: string
  quantity: number

  // ⭐ THÔNG TIN VARIANT (nếu có)
  variantId?: string
  variantName?: string // Tên hiển thị: "Đỏ - XL"
  sku?: string // SKU của variant
  color?: string // Màu sắc
  size?: string // Kích thước
  variantOptions?: Record<string, string> // { "Màu sắc": "Đỏ", "Size": "XL" }
}

type CartContextType = {
  cart: CartItem[]
  cartCount: number
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, variantId?: string) => void
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => void
  clearCart: () => void
  totalPrice: number
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

  // LOGIC THÊM GIỎ HÀNG
  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      // ⭐ So sánh cả productId VÀ variantId
      const existingItem = prev.find(
        (item) =>
          item._id === newItem._id && item.variantId === newItem.variantId
      )

      if (existingItem) {
        // Nếu đã có -> Tăng số lượng
        return prev.map((item) =>
          item._id === newItem._id && item.variantId === newItem.variantId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }

      // Nếu chưa có -> Thêm mới
      return [...prev, newItem]
    })

    toast.success('Đã thêm vào giỏ hàng')
  }

  // XÓA SẢN PHẨM
  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        return !(item._id === productId && item.variantId === variantId)
      })
    )
    toast.error('Đã xóa sản phẩm khỏi giỏ')
  }

  // CẬP NHẬT SỐ LƯỢNG
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

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('cart')
  }

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

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
        totalPrice
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

import { WishlistProvider } from '@/app/contexts/WishlistContext'
import Navbar from './components/navbar/Navbar'
import Footer from './components/Footer'
import { CartProvider } from '@/app/contexts/CartContext'
import { ToastProvider } from '@/app/(storefront)/components/ToastProvider'
// 👇 1. Import Providers
import Providers from '@/app/providers/providers'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dennis Shop',
  description: 'Techshop uy tín chất lượng'
}

export default function StorefrontLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    // 👇 2. Bọc Providers ở ngoài cùng
    <Providers>
      <WishlistProvider>
        <CartProvider>
          <ToastProvider>
            {/* Force light mode cho storefront */}
            <div className="flex flex-col min-h-screen light">
              <Navbar />

              {/* Main Content */}
              <main className="flex-1 bg-white">{children}</main>

              {/* Footer */}
              <Footer />
            </div>
          </ToastProvider>
        </CartProvider>
      </WishlistProvider>
    </Providers>
  )
}

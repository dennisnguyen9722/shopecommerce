import { WishlistProvider } from '@/app/contexts/WishlistContext'
import Navbar from './components/navbar/Navbar'
import Footer from './components/Footer'
import { CartProvider } from '@/app/contexts/CartContext'
import { ToastProvider } from '@/app/(storefront)/components/ToastProvider'

export default function StorefrontLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
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
  )
}

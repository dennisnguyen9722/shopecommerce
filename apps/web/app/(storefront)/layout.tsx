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
          <div className="flex flex-col min-h-screen">
            <Navbar />

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <Footer />
          </div>
        </ToastProvider>
      </CartProvider>
    </WishlistProvider>
  )
}

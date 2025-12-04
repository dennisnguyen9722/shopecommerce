'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/src/lib/api' // Import API client của bạn
import {
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  CreditCard,
  Heart
} from 'lucide-react'

// Định nghĩa kiểu dữ liệu Category
interface Category {
  _id: string
  name: string
  slug: string
}

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([])

  // Fetch danh mục từ API khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/public/categories')
        // Lấy tối đa 8 danh mục đầu tiên để hiển thị cho đẹp
        setCategories(res.data.slice(0, 8) || [])
      } catch (error) {
        console.error('Lỗi tải danh mục footer:', error)
      }
    }
    fetchCategories()
  }, [])

  return (
    <footer className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Top Section - Features */}
        <div className="border-b border-gray-700/50">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">Hàng chính hãng</div>
                  <div className="text-xs text-gray-400">Bảo hành 12 tháng</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">Giao hàng nhanh</div>
                  <div className="text-xs text-gray-400">
                    Miễn phí toàn quốc
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">Thanh toán linh hoạt</div>
                  <div className="text-xs text-gray-400">
                    Trả góp 0% lãi suất
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">Hỗ trợ 24/7</div>
                  <div className="text-xs text-gray-400">Tư vấn nhiệt tình</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: About */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Link
                  href="/"
                  className="relative group flex items-center gap-2"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl blur opacity-50" />
                    <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-2 shadow-lg">
                      <span className="text-2xl">🎁</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-lg leading-tight">
                      Dennis<span className="text-orange-500">Shop</span>
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                      Premium Store
                    </div>
                  </div>
                </Link>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Chuyên cung cấp các sản phẩm công nghệ chính hãng với giá tốt
                nhất. Uy tín - Chất lượng - Bảo hành chu đáo.
              </p>

              {/* Social Media */}
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-pink-500 hover:to-red-500 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-6 relative inline-block">
                Liên kết nhanh
                <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
              </h3>
              <ul className="space-y-3">
                {[
                  { name: 'Về chúng tôi', href: '/about' },
                  { name: 'Tin tức công nghệ', href: '/blog' },
                  { name: 'Kiểm tra đơn hàng', href: '/tracking' },
                  { name: 'Chương trình Loyalty', href: '/loyalty' },
                  { name: 'Tuyển dụng', href: '#' },
                  { name: 'Chính sách bảo hành', href: '#' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-orange-500 transition-colors text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-orange-500 transition-colors" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Categories (DYNAMIC DATA) */}
            <div>
              <h3 className="text-lg font-bold mb-6 relative inline-block">
                Danh mục sản phẩm
                <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
              </h3>
              <ul className="space-y-3">
                {categories.length > 0
                  ? categories.map((cat) => (
                      <li key={cat._id}>
                        <Link
                          href={`/category/${cat.slug}`}
                          className="text-gray-400 hover:text-orange-500 transition-colors text-sm flex items-center gap-2 group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-orange-500 transition-colors" />
                          {cat.name}
                        </Link>
                      </li>
                    ))
                  : // Skeleton loading state nếu chưa tải xong
                    [1, 2, 3, 4, 5].map((i) => (
                      <li
                        key={i}
                        className="h-4 w-32 bg-gray-700/50 rounded animate-pulse"
                      />
                    ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h3 className="text-lg font-bold mb-6 relative inline-block">
                Liên hệ
                <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Địa chỉ</div>
                    <div className="text-xs text-gray-400">
                      123 Nguyễn Văn Linh, Quận 7, TP.HCM
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Hotline</div>
                    <a
                      href="tel:0909123456"
                      className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      0909 123 456
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <a
                      href="mailto:support@dennisshop.vn"
                      className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      support@dennisshop.vn
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Giờ làm việc</div>
                    <div className="text-xs text-gray-400">
                      8:00 - 22:00 (Hàng ngày)
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400 text-center md:text-left">
                © {new Date().getFullYear()} Dennis Shop. All rights reserved.
                Made with{' '}
                <Heart className="w-4 h-4 inline text-red-500 fill-current" />{' '}
                in Vietnam
              </div>

              <div className="flex items-center gap-6">
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Chính sách bảo mật
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="
            fixed bottom-8 right-8 z-50
            w-12 h-12 rounded-2xl
            bg-gradient-to-br from-orange-500 to-pink-500
            shadow-2xl hover:shadow-orange-500/50
            flex items-center justify-center
            hover:scale-110 transition-all duration-300
            group
          "
        >
          <svg
            className="w-6 h-6 text-white group-hover:-translate-y-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </div>
    </footer>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import serverApi from '@/src/lib/serverApi'
import {
  Calendar,
  User,
  ArrowRight,
  Search,
  Clock,
  Tag,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

// Type định nghĩa (tái sử dụng từ trang detail)
type BlogPost = {
  _id: string
  title: string
  slug: string
  excerpt?: string
  thumbnailUrl?: string
  author?: { name: string; avatar?: string }
  categories?: { name: string; slug: string }[]
  createdAt: string
  publishedAt?: string
}

type Category = {
  _id: string
  name: string
  slug: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Gọi song song 2 API: Lấy bài viết và Lấy danh mục
        const [postsRes, catsRes] = await Promise.all([
          serverApi.get('/public/posts'),
          serverApi.get('/public/blog-categories') // API vừa tạo ở Bước 1
        ])

        setPosts(postsRes.data)
        setCategories(catsRes.data)
      } catch (error) {
        console.error('Lỗi tải dữ liệu blog:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Tách bài viết mới nhất làm Featured
  const featuredPost = posts[0]
  const otherPosts = posts.slice(1)

  // Lọc bài viết theo Search (Client-side simple filter)
  const filteredPosts = otherPosts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. HERO HEADER */}
      <div className="bg-gray-900 text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            DennisShop Blog
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Cập nhật tin tức công nghệ, đánh giá sản phẩm và thủ thuật hữu ích
            mới nhất dành cho bạn.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        {/* 2. FEATURED POST (Bài mới nhất) */}
        {featuredPost && !searchTerm && (
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block mb-12"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[400px] border border-gray-100 transform transition-all hover:-translate-y-1 hover:shadow-2xl">
              <div className="relative h-64 lg:h-full overflow-hidden">
                <Image
                  src={featuredPost.thumbnailUrl || '/placeholder-blog.jpg'}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">
                    Mới nhất
                  </span>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  {featuredPost.categories?.[0] && (
                    <span className="text-orange-600 font-semibold uppercase">
                      {featuredPost.categories[0].name}
                    </span>
                  )}
                  <span>•</span>
                  <span>
                    {format(
                      new Date(
                        featuredPost.publishedAt || featuredPost.createdAt
                      ),
                      'dd MMMM, yyyy',
                      { locale: vi }
                    )}
                  </span>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors leading-tight">
                  {featuredPost.title}
                </h2>

                {featuredPost.excerpt && (
                  <p className="text-gray-600 mb-8 line-clamp-3 text-lg">
                    {featuredPost.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-gray-100 relative overflow-hidden">
                    {featuredPost.author?.avatar ? (
                      <Image
                        src={featuredPost.author.avatar}
                        alt="Author"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">
                      {featuredPost.author?.name || 'Admin'}
                    </p>
                    <p className="text-gray-500">Tác giả</p>
                  </div>
                  <div className="ml-auto flex items-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform">
                    Đọc tiếp <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* 3. MAIN LIST (Các bài viết khác) */}
          <div className="lg:col-span-8">
            {/* Search Bar Mobile */}
            <div className="lg:hidden mb-8 relative">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
              <Search
                className="absolute left-4 top-3.5 text-gray-400"
                size={20}
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                {searchTerm
                  ? `Kết quả tìm kiếm: "${searchTerm}"`
                  : 'Bài viết mới'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Link
                    href={`/blog/${post.slug}`}
                    key={post._id}
                    className="group flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={post.thumbnailUrl || '/placeholder-blog.jpg'}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {post.categories?.[0] && (
                        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {post.categories[0].name}
                        </span>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Calendar size={14} />
                        {format(
                          new Date(post.publishedAt || post.createdAt),
                          'dd/MM/yyyy'
                        )}
                        <span className="mx-1">•</span>
                        <Clock size={14} /> 5 phút đọc
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {post.title}
                      </h4>

                      {post.excerpt && (
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden relative">
                            {post.author?.avatar && (
                              <Image
                                src={post.author.avatar}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {post.author?.name || 'Admin'}
                          </span>
                        </div>
                        <span className="text-orange-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                          Xem chi tiết <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-2 text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Search className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Không tìm thấy bài viết nào.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Placeholder */}
            {filteredPosts.length > 0 && (
              <div className="mt-12 flex justify-center">
                <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
                  Xem thêm bài viết cũ hơn
                </button>
              </div>
            )}
          </div>

          {/* 4. SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">
            {/* Search Widget */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hidden lg:block sticky top-24">
              <h4 className="font-bold text-gray-900 mb-4">Tìm kiếm</h4>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập từ khóa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none text-sm"
                />
                <Search
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
              </div>
            </div>

            {/* Categories Widget */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">
                Danh mục
              </h4>
              <div className="space-y-2">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/blog/category/${cat.slug}`}
                      className="flex items-center justify-between group p-2 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="text-gray-600 group-hover:text-orange-700 text-sm font-medium">
                        {cat.name}
                      </span>
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded-full group-hover:bg-orange-200 group-hover:text-orange-700 transition-colors">
                        <ChevronRight size={14} />
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    Chưa có danh mục.
                  </p>
                )}
              </div>
            </div>

            {/* Tags Cloud (Mockup) */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4">Chủ đề phổ biến</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'Công nghệ',
                  'Review',
                  'iPhone 15',
                  'MacBook',
                  'AI',
                  'Tips & Tricks'
                ].map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-colors border border-gray-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

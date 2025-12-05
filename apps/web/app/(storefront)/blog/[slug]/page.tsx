'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import serverApi from '@/src/lib/serverApi'
import {
  Calendar,
  User,
  Tag,
  Clock,
  ChevronLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

// TYPE CHUẨN THEO MODEL CỦA BẠN
type BlogPost = {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  thumbnailUrl?: string

  author?: {
    _id: string
    name: string
    avatar?: string
  }

  categories?: {
    _id: string
    name: string
    slug: string
  }[]

  tags?: {
    _id: string
    name: string
    slug: string
  }[]

  createdAt: string
  publishedAt?: string
  readTime?: number
}

export default function BlogDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const { data } = await serverApi.get(`/public/posts/${slug}`)
        setPost(data)

        const firstCategoryId = data?.categories?.[0]?._id

        if (firstCategoryId) {
          const { data: related } = await serverApi.get('/public/posts', {
            params: {
              category: firstCategoryId,
              limit: 3,
              exclude: data._id
            }
          })
          setRelatedPosts(related || [])
        }
      } catch (error) {
        console.error('Lỗi tải bài viết:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400 text-sm">Đang tải bài viết...</span>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Không tìm thấy bài viết
        </h1>
        <Link
          href="/blog"
          className="text-orange-600 hover:underline flex items-center gap-2"
        >
          <ChevronLeft size={20} /> Quay lại trang Blog
        </Link>
      </div>
    )
  }

  const displayDate = post.publishedAt ? post.publishedAt : post.createdAt

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 1. HERO SECTION */}
      <div className="relative w-full bg-gray-900 text-white pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={post.thumbnailUrl || '/placeholder-blog.jpg'}
            alt={post.title}
            fill
            className="object-cover opacity-40 blur-[2px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          {post.categories && post.categories.length > 0 && (
            <Link
              href={`/blog/category/${post.categories[0].slug}`}
              className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-300 text-xs font-bold uppercase tracking-wider mb-6 hover:bg-white/20 transition-all"
            >
              {post.categories[0].name}
            </Link>
          )}

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 drop-shadow-sm max-w-4xl mx-auto">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-white/20 relative">
                {post.author?.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt="Author"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-600">
                    <User size={14} />
                  </div>
                )}
              </div>
              <span className="text-white">{post.author?.name || 'Admin'}</span>
            </div>

            <span className="w-1 h-1 rounded-full bg-gray-500"></span>

            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-orange-400" />
              <span>
                {format(new Date(displayDate), 'dd MMMM, yyyy', { locale: vi })}
              </span>
            </div>

            <span className="w-1 h-1 rounded-full bg-gray-500"></span>

            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange-400" />
              <span>{post.readTime || 5} phút đọc</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-10 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* 2. MAIN CONTENT */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-10 border border-gray-100">
            <Link
              href="/blog"
              className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 mb-8 transition-colors group"
            >
              <ChevronLeft
                size={16}
                className="mr-1 group-hover:-translate-x-1 transition-transform"
              />{' '}
              Quay lại danh sách
            </Link>

            {/* 👇 ĐÃ SỬA LỖI Ở ĐÂY: Dùng &quot; thay cho " */}
            {post.excerpt && (
              <p className="text-xl md:text-2xl text-gray-600 font-serif italic mb-10 leading-relaxed">
                &quot;{post.excerpt}&quot;
              </p>
            )}

            <article
              className="prose prose-lg prose-slate max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900 
                    prose-p:text-gray-700 prose-p:leading-8
                    prose-a:text-orange-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                    prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-semibold text-gray-900 mr-2 flex items-center gap-1">
                    <Tag size={16} /> Tags:
                  </span>
                  {post.tags.map((tag) => (
                    <Link
                      key={tag._id}
                      href={`/blog/tag/${tag.slug}`}
                      className="bg-gray-100 hover:bg-orange-50 text-gray-600 hover:text-orange-600 px-3 py-1.5 rounded-lg text-sm transition-colors duration-200"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 p-6 bg-gray-50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-semibold text-gray-900 flex items-center gap-2">
                <Share2 size={20} className="text-orange-500" /> Thấy hay? Chia
                sẻ ngay:
              </span>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 text-blue-600 flex items-center justify-center hover:scale-110 hover:shadow-md transition-all">
                  <Facebook size={20} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 text-sky-500 flex items-center justify-center hover:scale-110 hover:shadow-md transition-all">
                  <Twitter size={20} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 text-blue-700 flex items-center justify-center hover:scale-110 hover:shadow-md transition-all">
                  <Linkedin size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-orange-50/50 rounded-2xl p-8 border border-orange-100 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-orange-500 rotate-3 group-hover:rotate-6 transition-transform">
              <Mail size={28} />
            </div>

            <h3 className="font-bold text-xl text-gray-900 mb-2">
              Đăng ký nhận tin
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Đừng bỏ lỡ những xu hướng công nghệ mới nhất. Chúng tôi gửi email
              vào mỗi sáng thứ 2.
            </p>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
              />
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-200 active:scale-95 flex items-center justify-center gap-2">
                Đăng ký ngay <ArrowRight size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Không spam, hủy đăng ký bất cứ lúc nào.
            </p>
          </div>

          {relatedPosts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                Bài viết liên quan
              </h3>
              <div className="space-y-6">
                {relatedPosts.map((rel) => (
                  <Link
                    href={`/blog/${rel.slug}`}
                    key={rel._id}
                    className="group flex gap-4 items-start"
                  >
                    <div className="relative w-24 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                      <Image
                        src={rel.thumbnailUrl || '/placeholder.png'}
                        alt={rel.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                        {rel.title}
                      </h4>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {rel.publishedAt
                          ? format(new Date(rel.publishedAt), 'dd/MM/yyyy')
                          : format(new Date(rel.createdAt), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

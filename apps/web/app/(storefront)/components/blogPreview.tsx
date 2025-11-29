import Link from 'next/link'
import Image from 'next/image'

type BlogPost = {
  _id?: string
  id?: string | number
  title: string
  excerpt: string
  thumbnailUrl: string
  slug: string
}

export default function BlogPreview({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="w-full py-16 bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* TIÊU ĐỀ */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
            📰 Tin mới nhất
          </h2>
          <p className="text-gray-600">Cập nhật thông tin công nghệ mới nhất</p>
        </div>

        {/* BLOG GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post._id || post.id}
              href={`/blog/${post.slug}`}
              className="
                group relative rounded-3xl overflow-hidden 
                bg-white/60 border border-gray-200/50 backdrop-blur-xl
                shadow-[0_5px_20px_rgba(0,0,0,0.05)]
                hover:shadow-[0_15px_40px_rgba(255,100,0,0.15)]
                transition-all duration-300 hover:-translate-y-2
              "
            >
              {/* HÌNH ẢNH */}
              <div className="relative w-full h-56 overflow-hidden">
                {post.thumbnailUrl ? (
                  <Image
                    src={post.thumbnailUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-6xl">📄</span>
                  </div>
                )}
                {/* Overlay tối dần khi hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* NỘI DUNG */}
              <div className="p-6">
                <h3 className="font-bold text-gray-800 text-lg mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {post.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                {/* LINK ĐỌC THÊM */}
                <div className="mt-4 flex items-center text-orange-600 font-medium text-sm group-hover:gap-2 transition-all">
                  <span>Đọc thêm</span>
                  <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

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
    <section>
      <h2 className="text-2xl font-semibold mb-6">Tin mới nhất</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post._id || post.id}
            href={`/blog/${post.slug}`}
            className="border rounded-xl overflow-hidden hover:shadow-lg transition"
          >
            <div className="relative w-full h-48">
              {post.thumbnailUrl ? (
                <Image
                  src={post.thumbnailUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            <div className="p-4">
              <h3 className="font-medium line-clamp-2">{post.title}</h3>

              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

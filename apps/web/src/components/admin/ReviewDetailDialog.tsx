'use client'

import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X, Star } from 'lucide-react'
import api from '@/src/lib/api'
import Image from 'next/image'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

// ==========================================
// TYPES
// ==========================================
type ReviewData = {
  _id: string
  product?: {
    _id: string
    name: string
    images?: (string | { url: string })[] // Update type để support cả object
  }
  customerName?: string
  customerEmail?: string
  isAnonymous?: boolean
  rating: number
  content: string
  images?: (string | { url: string })[] // Update type review images
  status: 'approved' | 'pending' | 'rejected'
  replies: {
    adminName: string
    content: string
    createdAt: string
  }[]
  createdAt: string
}

// ==========================================
// HELPERS
// ==========================================
function formatDateSafe(d?: string) {
  if (!d) return 'N/A'
  try {
    return format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: vi })
  } catch {
    return 'N/A'
  }
}

// Hàm lấy URL an toàn (xử lý cả string và object cloudinary)
function getImageUrl(img: any): string | null {
  if (!img) return null
  // Trường hợp 1: String URL
  if (typeof img === 'string' && img.trim() !== '') return img
  // Trường hợp 2: Object Cloudinary { url: "..." }
  if (typeof img === 'object' && img.url && typeof img.url === 'string')
    return img.url
  return null
}

// ==========================================
// COMPONENT
// ==========================================
export default function ReviewDetailDialog({
  reviewId,
  onClose
}: {
  reviewId: string | null
  onClose: () => void
}) {
  const [data, setData] = React.useState<ReviewData | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [reply, setReply] = React.useState('')

  React.useEffect(() => {
    if (!reviewId) {
      setData(null)
      return
    }

    let mounted = true
    const fetchDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/admin/reviews/${reviewId}`)
        if (!mounted) return
        setData(res.data)
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Lỗi tải đánh giá')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchDetail()
    return () => {
      mounted = false
    }
  }, [reviewId])

  const handleSendReply = async () => {
    if (!reply.trim()) return

    try {
      const res = await api.post(`/admin/reviews/${reviewId}/reply`, {
        content: reply.trim()
      })

      setData(res.data)
      setReply('')
    } catch (err) {
      console.error(err)
      alert('Lỗi gửi phản hồi')
    }
  }

  if (!reviewId) return null

  return (
    <RadixDialog.Root
      open={!!reviewId}
      onOpenChange={(open) => !open && onClose()}
    >
      <RadixDialog.Portal>
        {/* Overlay */}
        <RadixDialog.Overlay
          className="
          fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]
          data-[state=open]:animate-in data-[state=open]:fade-in-0
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0
        "
        />

        {/* Content */}
        <RadixDialog.Content
          aria-describedby={undefined} // Fix warning accessibility nhỏ nếu có
          className="
            fixed right-0 top-0 h-full z-[9999] bg-white dark:bg-gray-900
            flex flex-col max-h-screen overflow-hidden
            w-full md:w-[600px] lg:w-[700px] shadow-2xl
            data-[state=open]:animate-in data-[state=open]:slide-in-from-right
            data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right
            duration-300
          "
        >
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div>
              {/* SỬA LỖI 1: Dùng RadixDialog.Title thay vì h2 thường */}
              <RadixDialog.Title className="text-lg font-semibold">
                Chi tiết đánh giá
              </RadixDialog.Title>
              {data && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDateSafe(data.createdAt)}
                </p>
              )}
            </div>

            <RadixDialog.Close asChild>
              <button className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </RadixDialog.Close>
          </header>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-950">
            {loading ? (
              <div className="text-center py-40">Đang tải...</div>
            ) : error ? (
              <div className="text-center py-20 text-red-600">{error}</div>
            ) : data ? (
              <div className="space-y-8">
                {/* PRODUCT */}
                <section className="p-6 rounded-lg bg-white dark:bg-gray-800 border">
                  <h3 className="font-semibold mb-3">Sản phẩm</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative rounded bg-gray-100 overflow-hidden border">
                      {/* SỬA LỖI 2: Dùng hàm getImageUrl an toàn */}
                      {(() => {
                        const productImg = data.product?.images?.[0]
                        const validUrl = getImageUrl(productImg)

                        if (validUrl) {
                          return (
                            <Image
                              src={validUrl}
                              alt={data.product?.name || 'Product'}
                              fill
                              className="object-cover"
                            />
                          )
                        }
                        return (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                            No img
                          </div>
                        )
                      })()}
                    </div>
                    <div>
                      <div className="font-medium">
                        {data.product?.name || 'Sản phẩm đã xoá'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {data.product?._id}
                      </div>
                    </div>
                  </div>
                </section>

                {/* CUSTOMER */}
                <section className="p-6 rounded-lg bg-white dark:bg-gray-800 border">
                  <h3 className="font-semibold mb-3">Người đánh giá</h3>

                  {data.isAnonymous ? (
                    <p className="italic text-gray-500">Ẩn danh</p>
                  ) : (
                    <div className="text-sm space-y-2">
                      <div>
                        <div className="text-xs text-gray-500">Họ tên</div>
                        <div className="font-medium">
                          {data.customerName || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="font-medium">
                          {data.customerEmail || 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* RATING + CONTENT */}
                <section className="p-6 rounded-lg bg-white dark:bg-gray-800 border space-y-4">
                  <div className="flex gap-1 text-yellow-500">
                    {Array.from({ length: data.rating }).map((_, i) => (
                      <Star key={i} size={18} fill="gold" />
                    ))}
                  </div>

                  <p className="leading-relaxed whitespace-pre-line text-gray-800 dark:text-gray-200">
                    {data.content}
                  </p>

                  {/* Render Review Images */}
                  {Array.isArray(data.images) && data.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      {data.images.map((img, i) => {
                        const validUrl = getImageUrl(img)
                        if (!validUrl) return null

                        return (
                          <div
                            key={i}
                            className="relative w-full h-28 rounded bg-gray-100 overflow-hidden border"
                          >
                            <Image
                              src={validUrl}
                              alt={`review img ${i}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>

                {/* REPLIES */}
                {Array.isArray(data.replies) && data.replies.length > 0 && (
                  <section className="p-6 rounded-lg bg-white dark:bg-gray-800 border space-y-3">
                    <h3 className="font-semibold">Phản hồi từ Admin</h3>

                    {data.replies.map((r, i) => (
                      <div
                        key={i}
                        className="p-3 bg-gray-50 dark:bg-gray-900 border rounded"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{r.adminName}</span>
                          <span className="text-xs text-gray-500">
                            {formatDateSafe(r.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                          {r.content}
                        </p>
                      </div>
                    ))}
                  </section>
                )}

                {/* ADD NEW REPLY */}
                <section className="p-6 rounded-lg bg-white dark:bg-gray-800 border">
                  <h3 className="font-semibold mb-3">Trả lời đánh giá</h3>

                  <textarea
                    className="w-full p-3 border rounded-md bg-transparent min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Nhập nội dung trả lời..."
                  />

                  <button
                    onClick={handleSendReply}
                    className="mt-3 px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 font-medium transition-colors"
                  >
                    Gửi phản hồi
                  </button>
                </section>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <footer className="px-8 py-4 border-t bg-white dark:bg-gray-900">
            <div className="flex justify-end">
              <RadixDialog.Close asChild>
                <button className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Đóng
                </button>
              </RadixDialog.Close>
            </div>
          </footer>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

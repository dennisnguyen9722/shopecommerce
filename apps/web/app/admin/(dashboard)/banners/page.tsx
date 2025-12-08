'use client'

import { useEffect, useState } from 'react'
import api from '@/src/lib/api'

import GlassCard from '@/src/components/admin/GlassCard'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import BannerDialog from '@/src/components/banners/BannerDialog'

interface Banner {
  _id: string
  imageUrl: string
  title?: string
  subtitle?: string
  link?: string
  isActive: boolean
}

export default function BannersPage() {
  const [items, setItems] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/banners')
      setItems(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(fetchData)
  }, [])

  const openCreate = () => {
    setEditing(null)
    setOpenDialog(true)
  }

  const openEdit = (banner: Banner) => {
    setEditing(banner)
    setOpenDialog(true)
  }

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight dark:text-gray-900">
            Banner
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý slideshow hiển thị ngoài trang chủ.
          </p>
        </div>

        <Button onClick={openCreate}>＋ Thêm banner</Button>
      </div>

      {/* LIST WRAPPER */}
      <GlassCard className="p-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Chưa có banner nào — hãy thêm banner mới.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((b) => (
              <div
                key={b._id}
                className="overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow hover:shadow-lg transition hover:scale-[1.01]"
              >
                {/* IMAGE */}
                <div className="w-full h-44 overflow-hidden">
                  <img
                    src={b.imageUrl}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-4 space-y-2">
                  <div className="font-medium text-base">
                    {b.title || 'Không có tiêu đề'}
                  </div>

                  {b.subtitle && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {b.subtitle}
                    </div>
                  )}

                  {b.link && (
                    <div className="text-xs text-blue-600 break-all">
                      {b.link}
                    </div>
                  )}

                  <div className="pt-1">
                    {b.isActive ? (
                      <Badge className="bg-green-100 text-green-700 border border-green-300/50">
                        Đang hiển thị
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Đã ẩn</Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => openEdit(b)}
                  >
                    Chỉnh sửa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* DIALOG */}
      <BannerDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        data={editing}
        onSaved={fetchData}
      />
    </div>
  )
}

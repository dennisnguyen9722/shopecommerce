/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Building2, Globe, Trash2, AlertCircle } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import GlassCard from '@/src/components/admin/GlassCard'
import ImageUploader from '@/src/components/admin/ImageUploader'
import api from '@/src/lib/api'
import { generateSlug } from '@/lib/utils'

export default function EditBrandPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [logo, setLogo] = useState<{ url: string; public_id: string }[]>([])
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  // Fetch brand data
  const { data: brand, isLoading } = useQuery({
    queryKey: ['brand', id],
    queryFn: async () => {
      const res = await api.get(`/admin/brands/${id}`)
      return res.data
    }
  })

  // Load dữ liệu vào form
  useEffect(() => {
    if (brand) {
      setName(brand.name || '')
      setSlug(brand.slug || '')
      setDescription(brand.description || '')
      setWebsite(brand.website || '')
      setStatus(brand.status || 'active')

      // Convert logo URL string to ImageUploader format
      if (brand.logo) {
        setLogo([
          {
            url: brand.logo,
            public_id: brand.logo.split('/').pop()?.split('.')[0] || ''
          }
        ])
      } else {
        setLogo([])
      }
    }
  }, [brand])

  const handleNameChange = (value: string) => {
    setName(value)
  }

  // Mutation cập nhật
  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        slug,
        description: description.trim(),
        logo: logo.length > 0 ? logo[0].url : '',
        website,
        status
      }

      const res = await api.put(`/admin/brands/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Cập nhật thương hiệu thành công!')
      queryClient.invalidateQueries({ queryKey: ['brand', id] })
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      router.push('/admin/brands')
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Lỗi khi cập nhật thương hiệu')
    }
  })

  // Mutation xóa
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/brands/${id}`)
    },
    onSuccess: () => {
      toast.success('Xóa thương hiệu thành công!')
      router.push('/admin/brands')
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Không thể xóa thương hiệu')
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <GlassCard>
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <GlassCard>
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">
                Không tìm thấy thương hiệu
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push('/admin/brands')}
              >
                Quay lại danh sách
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            Thương hiệu / {brand?.name}
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Chỉnh sửa thương hiệu
          </h1>
        </div>
        <Button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="px-6"
        >
          {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>

      {/* Thống kê nhanh */}
      {brand.productsCount > 0 && (
        <GlassCard className="animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">
              Thương hiệu này đang có{' '}
              <strong>{brand.productsCount} sản phẩm</strong> liên kết
            </p>
          </div>
        </GlassCard>
      )}

      {/* Thông tin cơ bản */}
      <GlassCard className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="border-b border-white/20 dark:border-gray-700/50 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Thông tin cơ bản
          </h2>
        </div>

        <div className="space-y-6">
          {/* Tên thương hiệu */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              Tên thương hiệu <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nhập tên thương hiệu..."
              className="bg-white/50 dark:bg-gray-800/50 border-white/40 dark:border-gray-700/40"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2 max-w-md">
            <Label className="text-gray-700 dark:text-gray-300">
              Slug (URL)
            </Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              placeholder="brand-slug"
              className="bg-white/50 dark:bg-gray-800/50 border-white/40 dark:border-gray-700/40 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              URL thân thiện: /brands/{slug || 'brand-slug'}
            </p>
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Mô tả</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả về thương hiệu..."
              rows={4}
              className="bg-white/50 dark:bg-gray-800/50 border-white/40 dark:border-gray-700/40 resize-none"
            />
          </div>

          {/* Trạng thái */}
          <div className="space-y-2 max-w-xs">
            <Label className="text-gray-700 dark:text-gray-300">
              Trạng thái
            </Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-white/40 dark:border-gray-700/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {/* Logo & Website */}
      <GlassCard className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="border-b border-white/20 dark:border-gray-700/50 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Logo & Website
          </h2>
        </div>

        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              Logo thương hiệu
            </Label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Tải lên logo của thương hiệu (khuyến nghị: 400x400px, nền trong
              suốt)
            </p>
            <ImageUploader initial={logo} onChange={setLogo} maxImages={1} />

            {logo.length > 0 && (
              <div className="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/40 dark:border-gray-700/40">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Xem trước logo:
                </p>
                <div className="w-24 h-24 bg-white rounded-lg border shadow-sm flex items-center justify-center overflow-hidden">
                  <img
                    src={logo[0].url}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain p-2"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="bg-white/50 dark:bg-gray-800/50 border-white/40 dark:border-gray-700/40"
            />
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

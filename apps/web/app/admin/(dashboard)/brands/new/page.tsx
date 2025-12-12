'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Building2, Globe } from 'lucide-react'

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

export default function CreateBrandPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [logo, setLogo] = useState<{ url: string; public_id: string }[]>([])
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(generateSlug(value))
  }

  // Mutation tạo thương hiệu
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        slug,
        description: description.trim(),
        logo: logo.length > 0 ? logo[0].url : '', // Lấy URL từ ảnh đầu tiên
        website,
        status
      }

      const res = await api.post('/admin/brands', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Tạo thương hiệu thành công!')
      router.push('/admin/brands')
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Lỗi khi tạo thương hiệu')
    }
  })

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên thương hiệu')
      return
    }
    createMutation.mutate()
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">
              Thương hiệu / Tạo mới
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Tạo thương hiệu mới
            </h1>
          </div>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Đang xử lý...' : 'Tạo thương hiệu'}
          </Button>
        </div>

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
    </div>
  )
}

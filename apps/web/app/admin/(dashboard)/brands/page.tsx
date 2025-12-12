'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Globe,
  Package,
  Building2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import GlassCard from '@/src/components/admin/GlassCard'
import { Badge } from '@/components/ui/badge'
import api from '@/src/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Brand {
  _id: string
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  status: 'active' | 'inactive'
  productsCount: number
  createdAt: string
}

export default function BrandsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  const router = useRouter()

  // Fetch brands
  const { data, isLoading, error } = useQuery({
    queryKey: ['brands', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        page: '1',
        limit: '50'
      })
      const res = await api.get(`/admin/brands?${params}`)
      return res.data
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/brands/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Không thể xóa thương hiệu')
    }
  })

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/admin/brands/${id}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    }
  })

  const brands = data?.items || []

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa thương hiệu "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  const toggleStatus = (brand: Brand) => {
    const newStatus = brand.status === 'active' ? 'inactive' : 'active'
    updateStatusMutation.mutate({ id: brand._id, status: newStatus })
  }

  return (
    <div className="p-4 md:p-6 space-y-6 w-full max-w-[100vw] overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold dark:text-gray-900">
            Thương hiệu
          </h1>
          <Button onClick={() => router.push('/admin/brands/new')}>
            <Plus className="w-4 h-4 mr-2" /> Thêm thương hiệu
          </Button>
        </div>

        {/* Filters */}
        <GlassCard className="animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          <div className="flex gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm thương hiệu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/40 dark:border-gray-700/40"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-white/40 dark:border-gray-700/40 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
        </GlassCard>

        {/* Brands Table */}
        <GlassCard className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">
                Lỗi tải dữ liệu: {(error as any).message}
              </p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Đang tải...</p>
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có thương hiệu nào</p>
              <Link href="/admin/brands/new">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo thương hiệu đầu tiên
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20 dark:border-gray-700/50">
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">
                      Thương hiệu
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">
                      Mô tả
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">
                      Website
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700 dark:text-gray-300">
                      Sản phẩm
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700 dark:text-gray-300">
                      Trạng thái
                    </th>
                    <th className="text-right p-4 font-semibold text-gray-700 dark:text-gray-300">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand: Brand) => (
                    <tr
                      key={brand._id}
                      className="border-b border-white/10 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {brand.logo ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shadow-sm">
                              <Image
                                src={brand.logo}
                                alt={brand.name}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-sm">
                              {brand.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {brand.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {brand.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {brand.description || '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        {brand.website ? (
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Globe className="w-3 h-3" />
                            <span className="max-w-[150px] truncate">
                              {brand.website.replace(/^https?:\/\//, '')}
                            </span>
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        >
                          {brand.productsCount}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleStatus(brand)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Badge
                            variant={
                              brand.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                            className={
                              brand.status === 'active'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700'
                            }
                          >
                            {brand.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                          </Badge>
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/brands/${brand._id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white/50 dark:bg-gray-800/50"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                            onClick={() => handleDelete(brand._id, brand.name)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

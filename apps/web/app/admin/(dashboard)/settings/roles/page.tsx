'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/src/lib/api'
import GlassCard from '@/src/components/admin/GlassCard'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'
import RoleConfigModal from '@/app/admin/(dashboard)/settings/roles/role-modal'

// ICONS
import { ShieldCheck, ShieldAlert, Plus } from 'lucide-react'

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<any>(null)

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await api.get('/admin/roles')
      return res.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/roles/${id}`)
    },
    onSuccess: () => {
      toast.success('Xóa role thành công!')
      refetch()
    },
    onError: () => toast.error('Không thể xóa role')
  })

  if (isLoading) return <p>Đang tải...</p>

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold dark:text-gray-900">
            Phân quyền (Roles)
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Tạo, chỉnh sửa và phân quyền cho nhân sự trong hệ thống.
          </p>
        </div>

        <Button
          onClick={() =>
            setSelectedRole({
              _id: null,
              name: '',
              description: '',
              permissions: []
            })
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Role mới
        </Button>
      </div>

      <div className="space-y-4">
        {data?.map((role: any) => (
          <GlassCard key={role._id}>
            <div className="flex items-center justify-between py-4">
              {/* LEFT */}
              <div className="flex items-center gap-4">
                {role.isSystem ? (
                  <div className="p-2 rounded-lg bg-purple-50">
                    <ShieldCheck className="h-6 w-6 text-purple-600" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-gray-100">
                    <ShieldAlert className="h-6 w-6 text-gray-600" />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold">{role.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>

                  <p className="text-xs mt-1 text-gray-500">
                    {role.permissions.length} quyền
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setSelectedRole(role)}>
                  Chỉnh sửa
                </Button>

                {!role.isSystem && (
                  <Button
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(role._id)}
                  >
                    Xóa
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Modal */}
      <RoleConfigModal
        role={selectedRole}
        onClose={() => setSelectedRole(null)}
        onUpdated={() => refetch()}
      />
    </div>
  )
}

'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/src/lib/api'
import GlassCard from '@/src/components/admin/GlassCard'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { UserCircle, Plus } from 'lucide-react'
import { useState } from 'react'
import CreateUserModal from '@/app/admin/(dashboard)/settings/users/user-create-modal'

interface RoleType {
  _id: string
  name: string
  isSystem?: boolean
}

interface UserType {
  _id: string
  name: string
  email: string
  role: RoleType | null
}

export default function UsersPage() {
  const [openCreate, setOpenCreate] = useState(false)

  const {
    data: users,
    refetch,
    isLoading
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/admin/users')
      return res.data
    }
  })

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await api.get('/admin/roles')
      return res.data
    }
  })

  const assignMutation = useMutation({
    mutationFn: async ({
      userId,
      roleId
    }: {
      userId: string
      roleId: string
    }) => {
      await api.put(`/admin/users/${userId}/role`, { roleId })
    },
    onSuccess: () => {
      toast.success('Cập nhật role thành công!')
      refetch()
    },
    onError: () => toast.error('Không thể cập nhật role')
  })

  if (isLoading) return <p>Đang tải...</p>

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý người dùng</h1>
          <p className="text-muted-foreground">
            Tạo user mới, gán role và phân quyền cho từng tài khoản.
          </p>
        </div>

        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Tạo User
        </Button>
      </div>

      <div className="space-y-4">
        {users?.map((user: UserType) => (
          <GlassCard key={user._id}>
            <div className="flex items-center justify-between py-4">
              {/* LEFT */}
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-50">
                  <UserCircle className="h-6 w-6 text-blue-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3">
                <Select
                  value={user.role?._id ?? ''}
                  disabled={user.role?.isSystem}
                  onValueChange={(roleId) =>
                    assignMutation.mutate({ userId: user._id, roleId })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Chọn role" />
                  </SelectTrigger>

                  <SelectContent>
                    {roles?.map((role: RoleType) => (
                      <SelectItem key={role._id} value={role._id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() =>
                    assignMutation.mutate({ userId: user._id, roleId: '' })
                  }
                >
                  Xóa Role
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* MODAL */}
      <CreateUserModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        roles={roles || []}
        onCreated={() => refetch()}
      />
    </div>
  )
}

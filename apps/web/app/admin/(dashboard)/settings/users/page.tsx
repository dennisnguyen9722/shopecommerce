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

  if (isLoading)
    return <p className="p-6 text-gray-600 dark:text-gray-300">Đang tải...</p>

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold dark:text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Tạo user mới, gán role và phân quyền cho từng tài khoản.
          </p>
        </div>

        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo User mới
        </Button>
      </div>

      <div className="space-y-4">
        {users?.map((user: UserType) => (
          <GlassCard key={user._id} className="p-0">
            <div className="flex items-center justify-between p-6">
              {/* LEFT */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <UserCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {user.email}
                  </p>
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
                  <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
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
                  className="min-w-[100px]"
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

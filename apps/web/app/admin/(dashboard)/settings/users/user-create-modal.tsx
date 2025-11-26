'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useState } from 'react'
import api from '@/src/lib/api'
import { toast } from 'sonner'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  roles: any[]
  onCreated: () => void
}

export default function CreateUserModal({
  open,
  onClose,
  roles,
  onCreated
}: CreateUserModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')

  const create = async () => {
    try {
      await api.post('/admin/users', {
        name,
        email,
        password,
        roleId
      })

      toast.success('Tạo user thành công!')
      onCreated()
      onClose()

      setName('')
      setEmail('')
      setPassword('')
      setRoleId('')
    } catch (err) {
      toast.error('Không thể tạo user!')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo User mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Tên người dùng"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            placeholder="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn role" />
            </SelectTrigger>

            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r._id} value={r._id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="w-full" onClick={create}>
            Tạo User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

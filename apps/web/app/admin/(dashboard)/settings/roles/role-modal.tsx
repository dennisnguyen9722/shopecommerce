/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { PERMISSION_GROUPS } from './permission-groups'

// ==========================
// TYPES
// ==========================
export interface RoleType {
  _id?: string
  name: string
  description: string
  permissions: string[]
  isSystem?: boolean
}

interface RoleConfigModalProps {
  role: RoleType | null // null = create mode
  onClose: () => void
  onUpdated: () => void
}

// ==========================
// COMPONENT
// ==========================
export default function RoleConfigModal({
  role,
  onClose,
  onUpdated
}: RoleConfigModalProps) {
  const isEdit = !!(role && role._id)

  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [permissions, setPermissions] = useState<string[]>([])

  // Pre-fill khi edit
  useEffect(() => {
    if (role && isEdit) {
      setName(role.name)
      setDesc(role.description)
      setPermissions(role.permissions)
    } else {
      // Reset khi tạo mới
      setName('')
      setDesc('')
      setPermissions([])
    }
  }, [role, isEdit])

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    )
  }

  const save = async () => {
    try {
      if (isEdit && role?._id) {
        // UPDATE ROLE
        await api.put(`/admin/roles/${role._id}`, {
          name,
          description: desc,
          permissions
        })
      } else {
        // CREATE ROLE
        await api.post(`/admin/roles`, {
          name,
          description: desc,
          permissions
        })
      }

      toast.success('Lưu thành công!')
      onUpdated()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Không thể lưu role!')
    }
  }

  return (
    <Dialog open={!!role} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa Role' : 'Tạo Role mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Tên role"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Mô tả"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          {/* PERMISSIONS */}
          <div className="max-h-[320px] overflow-auto border rounded-md p-3 space-y-3">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="font-semibold mb-1">{group.label}</p>

                {group.permissions.map((p) => (
                  <label key={p.key} className="flex gap-2 py-1 text-sm">
                    <input
                      type="checkbox"
                      checked={permissions.includes(p.key)}
                      onChange={() => togglePermission(p.key)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            ))}
          </div>

          <Button className="w-full" onClick={save}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo Role'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

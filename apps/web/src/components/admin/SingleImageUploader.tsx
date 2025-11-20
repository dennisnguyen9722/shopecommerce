'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ImageIcon, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (url: string) => void
}

export default function SingleImageUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSelect() {
    inputRef.current?.click()
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const form = new FormData()
    form.append('file', file)
    form.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    )

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: form }
    )

    const data = await res.json()
    onChange(data.secure_url)
  }

  function removeImage() {
    onChange('')
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative">
          <img
            src={value}
            className="rounded-md border w-full object-cover"
            alt="thumbnail"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={handleSelect}
          className="border rounded-md p-6 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-accent"
        >
          <ImageIcon className="h-10 w-10 mb-2" />
          <p className="text-sm">Chọn ảnh thumbnail</p>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}

'use client'

import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import { useCallback, useRef } from 'react'

const ReactQuillDynamic: any = dynamic(() => import('react-quill-new'), {
  ssr: false
})

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: Props) {
  const quillRef = useRef<any>(null)

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.onchange = async () => {
      const file = input.files?.[0]
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
      const editor = quillRef.current?.getEditor()
      if (!editor) return

      const range = editor.getSelection(true)
      editor.insertEmbed(range.index, 'image', data.secure_url)
    }

    input.click()
  }, [])

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: { image: handleImageUpload }
    }
  }

  return (
    <div className="mt-2">
      <ReactQuillDynamic
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
      />
    </div>
  )
}

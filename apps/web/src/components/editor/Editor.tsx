'use client'

import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Minus,
  Code2,
  Table as TableIcon,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Image as ImageIcon,
  Eraser
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

import ImageUploader from '@/src/components/admin/ImageUploader'

type UploadedImage = { url: string; public_id: string }

type EditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function Editor({ value, onChange, placeholder }: EditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Nhập nội dung…'
      })
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    immediatelyRender: false
  })

  // Sync content nếu value từ ngoài đổi
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  // ====== IMAGE HANDLING (dùng lại ImageUploader) ======
  const openImageDialog = () => {
    setUploadedImages([])
    setImageDialogOpen(true)
  }

  const insertFirstImage = () => {
    const first = uploadedImages[0]
    if (!first) return
    editor
      .chain()
      .focus()
      .setImage({
        src: first.url
      })
      .run()
    setImageDialogOpen(false)
  }

  // ====== LINK ======
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Nhập URL liên kết:', previousUrl || '')

    if (url === null) return

    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run()
  }

  // Helper: style cho button đang active
  const activeVariant = (isActive: boolean) =>
    isActive ? 'default' : ('secondary' as const)

  return (
    <div className="border rounded-xl p-3 space-y-2 bg-white shadow-sm dark:text-gray-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Text style */}
        <div className="flex flex-wrap items-center gap-1 pr-2 mr-2 border-r">
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('heading', { level: 1 }))}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('heading', { level: 2 }))}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('heading', { level: 3 }))}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 size={16} />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1 pr-2 mr-2 border-r">
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('bold'))}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('italic'))}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('underline'))}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('strike'))}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('highlight'))}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter size={16} />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex flex-wrap items-center gap-1 pr-2 mr-2 border-r">
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('bulletList'))}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('orderedList'))}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('taskList'))}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            <ListTodo size={16} />
          </Button>
        </div>

        {/* Align */}
        <div className="flex flex-wrap items-center gap-1 pr-2 mr-2 border-r">
          <Button
            size="sm"
            variant={activeVariant(editor.isActive({ textAlign: 'left' }))}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive({ textAlign: 'center' }))}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive({ textAlign: 'right' }))}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive({ textAlign: 'justify' }))}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          >
            <AlignJustify size={16} />
          </Button>
        </div>

        {/* Block level */}
        <div className="flex flex-wrap items-center gap-1 pr-2 mr-2 border-r">
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('blockquote'))}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={16} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('codeBlock'))}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code2 size={16} />
          </Button>
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('table'))}
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <TableIcon size={16} />
          </Button>
        </div>

        {/* Media & link */}
        <div className="flex flex-wrap items-center gap-1 pr-2 mr-2 border-r">
          <Button
            size="sm"
            variant={activeVariant(editor.isActive('link'))}
            onClick={setLink}
          >
            <LinkIcon size={16} />
          </Button>
          <Button size="sm" variant="secondary" onClick={openImageDialog}>
            <ImageIcon size={16} />
          </Button>
        </div>

        {/* Undo / redo / clear */}
        <div className="flex flex-wrap items-center gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo2 size={16} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo2 size={16} />
          </Button>
          <Button size="sm" variant="secondary" onClick={clearFormatting}>
            <Eraser size={16} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="border rounded-lg px-3 py-2 bg-white">
        <EditorContent
          editor={editor}
          className="prose prose-sm sm:prose-base max-w-none min-h-[220px] focus:outline-none"
        />
      </div>

      {/* IMAGE DIALOG – dùng lại ImageUploader */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chèn hình ảnh</DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            <ImageUploader
              initial={[]}
              onChange={(imgs: UploadedImage[]) => setUploadedImages(imgs)}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={insertFirstImage}
              disabled={uploadedImages.length === 0}
            >
              Chèn ảnh đầu tiên vào nội dung
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

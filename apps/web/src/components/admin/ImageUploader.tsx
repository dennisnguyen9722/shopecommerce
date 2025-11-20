'use client'

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'
import api from '@/src/lib/api'

/* -------------------------------------------------------
   SORTABLE IMAGE ITEM (DRAG + COVER + DELETE)
-------------------------------------------------------- */
function SortableImage({
  item,
  isCover,
  onRemove,
  onChooseCover
}: {
  item: { url: string; public_id: string }
  isCover: boolean
  onRemove: () => void
  onChooseCover: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item.public_id
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition"
    >
      <img
        src={item.url}
        alt=""
        className="object-cover w-full h-32 cursor-move"
        {...attributes}
        {...listeners}
      />

      {/* COVER BADGE */}
      {isCover && (
        <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-2 py-[2px] rounded shadow">
          Ảnh đại diện
        </div>
      )}

      {/* HOVER OVERLAY */}
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition pointer-events-none" />

      {/* REMOVE BUTTON */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition shadow"
      >
        X
      </button>

      {/* SET COVER BUTTON */}
      {!isCover && (
        <button
          type="button"
          onClick={onChooseCover}
          className="absolute bottom-1 left-1 bg-white/80 text-xs px-2 py-[2px] rounded shadow opacity-0 group-hover:opacity-100 transition"
        >
          Chọn đại diện
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------
   MAIN IMAGE UPLOADER
-------------------------------------------------------- */
export default function ImageUploader({
  initial = [],
  onChange
}: {
  initial?: { url: string; public_id: string }[]
  onChange: (imgs: { url: string; public_id: string }[]) => void
}) {
  const [images, setImages] = useState<{ url: string; public_id: string }[]>([])
  const [coverId, setCoverId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  /* ----------------------
     APPLY INITIAL DATA (EDIT ONLY)
  ------------------------ */
  useEffect(() => {
    // Chỉ chạy khi EDIT PRODUCT (initial có ảnh)
    if (initial && initial.length > 0) {
      setImages(initial)
      setCoverId(initial[0].public_id)
    }
  }, [initial])

  /* ----------------------
     UPLOAD HANDLER
  ------------------------ */
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)

    const form = new FormData()
    Array.from(files).forEach((f) => form.append('images', f))

    try {
      const res = await api.post('/admin/products/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const uploaded = res.data.images
      const updated = [...images, ...uploaded]

      // tự set ảnh đầu tiên làm cover nếu chưa có
      if (!coverId && uploaded.length > 0) {
        setCoverId(uploaded[0].public_id)
      }

      setImages(updated)
      onChange(updated)
    } finally {
      setUploading(false)
    }
  }

  /* ----------------------
     DRAG END
  ------------------------ */
  const sensors = useSensors(useSensor(PointerSensor))

  const onDragEnd = (event: any) => {
    const { active, over } = event
    if (!over) return

    if (active.id !== over.id) {
      const oldIndex = images.findIndex((i) => i.public_id === active.id)
      const newIndex = images.findIndex((i) => i.public_id === over.id)

      const reordered = arrayMove(images, oldIndex, newIndex)
      setImages(reordered)
      onChange(reordered)
    }
  }

  /* -------------------------------------------------------
     RENDER
  -------------------------------------------------------- */
  return (
    <div className="space-y-4">
      {/* UPLOAD BOX */}
      <label className="block border-2 border-dashed rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition text-center text-gray-600 font-medium">
        <div>Chọn ảnh sản phẩm</div>
        <input
          type="file"
          multiple
          className="hidden"
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </label>

      {uploading && (
        <p className="text-sm text-blue-600 animate-pulse">
          Đang upload ảnh...
        </p>
      )}

      {/* IMAGE GRID */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={images.map((i) => i.public_id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <SortableImage
                  key={img.public_id}
                  item={img}
                  isCover={coverId === img.public_id}
                  onRemove={() => {
                    const newList = images.filter(
                      (i) => i.public_id !== img.public_id
                    )
                    setImages(newList)
                    onChange(newList)

                    if (coverId === img.public_id) {
                      setCoverId(newList[0]?.public_id ?? null)
                    }
                  }}
                  onChooseCover={() => setCoverId(img.public_id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

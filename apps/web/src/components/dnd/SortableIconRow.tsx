'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

export default function SortableIconRow({ id, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab p-2 rounded-md hover:bg-neutral-200/50 active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5 text-gray-500" />
      </button>

      <div className="flex-1">{children}</div>
    </div>
  )
}

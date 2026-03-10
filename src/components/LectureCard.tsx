import { useRef, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { CuratorEntry, Lecture } from '../types/api'

interface LectureCardProps {
  lecture: Lecture
}

function CuratorAvatar({ curator }: { curator: CuratorEntry }) {
  const initials = curator.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const avatarUrl = curator.avatar ? `https://conf.ontico.ru${curator.avatar}` : null

  return (
    <div
      title={curator.name}
      className="w-8 h-8 rounded-full border-2 border-white overflow-hidden flex-shrink-0 -ml-2 first:ml-0 bg-blue-100 flex items-center justify-center"
    >
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={curator.name}
          className="w-full h-full object-cover"
        />
      )}
      {!avatarUrl && (
        <span className="text-xs font-medium text-blue-700">{initials}</span>
      )}
    </div>
  )
}

export function LectureCard({ lecture }: LectureCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lecture.id,
  })

  // Track whether a drag was activated so we can suppress the click
  const didDragRef = useRef(false)
  useEffect(() => {
    if (isDragging) didDragRef.current = true
  }, [isDragging])

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  const mainSpeaker =
    lecture.speakers.speakers.find((s) => s.is_main) ?? lecture.speakers.speakers[0]

  const curators = lecture.curator.value

  function handleClick() {
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    window.open(`https://conf.ontico.ru/lectures/${lecture.id}/discuss`, '_blank')
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition-all select-none"
    >
      {/* Title */}
      <p
        className="text-sm font-medium text-gray-900 line-clamp-3 leading-snug mb-1"
        title={lecture.title.value}
      >
        {lecture.title.value}
      </p>

      {/* Speaker */}
      {mainSpeaker && (
        <p className="text-xs text-gray-500 mb-2 truncate">{mainSpeaker.value}</p>
      )}

      {/* Curators avatar stack */}
      {curators.length > 0 && (
        <div className="flex items-center mt-1">
          {curators.map((curator) => (
            <CuratorAvatar key={curator.id} curator={curator} />
          ))}
        </div>
      )}
    </div>
  )
}

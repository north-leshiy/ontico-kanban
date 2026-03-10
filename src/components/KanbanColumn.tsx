import { useDroppable } from '@dnd-kit/core'
import type { Decision, Lecture } from '../types/api'
import { LectureCard } from './LectureCard'

interface KanbanColumnProps {
  decision: Decision
  lectures: Lecture[]
}

export function KanbanColumn({ decision, lectures }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: decision.variant })

  return (
    <div className="flex flex-col flex-shrink-0 w-64 h-full">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <h2 className="text-sm font-semibold text-gray-700 truncate">{decision.name}</h2>
        <span className="ml-2 text-xs font-medium bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 flex-shrink-0">
          {lectures.length}
        </span>
      </div>

      {/* Cards container */}
      <div
        ref={setNodeRef}
        className={[
          'flex-1 overflow-y-auto rounded-xl p-2 space-y-2 min-h-16 transition-colors',
          isOver ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-gray-100',
        ].join(' ')}
      >
        {lectures.map((lecture) => (
          <LectureCard key={lecture.id} lecture={lecture} />
        ))}
        {lectures.length === 0 && (
          <p className="text-xs text-gray-400 text-center pt-4">Нет заявок</p>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { fetchGetInfo, fetchAllTechLeadLectures, setDecision, ApiError } from './api/client'
import type { CuratorEntry, Decision, GetInfoResult, Lecture } from './types/api'
import { KanbanColumn } from './components/KanbanColumn'
import { LectureCard } from './components/LectureCard'
import { CuratorFilter } from './components/CuratorFilter'
import { LoadingScreen } from './components/LoadingScreen'
import { ErrorScreen } from './components/ErrorScreen'

type LoadState = 'idle' | 'loading' | 'error' | 'ready'

export function KanbanBoard() {
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [error, setError] = useState<string>('')
  const [meta, setMeta] = useState<GetInfoResult | null>(null)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [toastError, setToastError] = useState<string | null>(null)
  const [activeLectureId, setActiveLectureId] = useState<number | null>(null)
  const [selectedCuratorIds, setSelectedCuratorIds] = useState<Set<number>>(new Set())

  const load = useCallback(async () => {
    setLoadState('loading')
    setError('')
    try {
      const info = await fetchGetInfo()
      setMeta(info)
      const all = await fetchAllTechLeadLectures()
      setLectures(all)
      setLoadState('ready')
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Произошла ошибка при загрузке данных'
      setError(msg)
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveLectureId(event.active.id as number)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveLectureId(null)
    const { active, over } = event
    if (!over) return

    const lectureId = active.id as number
    const newVariant = over.id as string
    const lecture = lectures.find((l) => l.id === lectureId)
    if (!lecture || lecture.decision.variant === newVariant) return

    const prevVariant = lecture.decision.variant
    const newDecisionName = meta?.decisions.find((d) => d.variant === newVariant)?.name ?? newVariant

    // Optimistic update
    setLectures((prev) =>
      prev.map((l) =>
        l.id === lectureId
          ? { ...l, decision: { ...l.decision, variant: newVariant, value: newDecisionName } }
          : l
      )
    )

    try {
      await setDecision(lectureId, newVariant)
    } catch {
      // Rollback
      setLectures((prev) =>
        prev.map((l) =>
          l.id === lectureId ? { ...l, decision: { ...l.decision, variant: prevVariant } } : l
        )
      )
      setToastError('Не удалось изменить статус заявки')
      setTimeout(() => setToastError(null), 4000)
    }
  }

  if (loadState === 'loading' || loadState === 'idle') return <LoadingScreen />
  if (loadState === 'error') return <ErrorScreen error={error} onRetry={() => void load()} />
  if (!meta) return null

  const activeLecture = activeLectureId !== null
    ? lectures.find((l) => l.id === activeLectureId) ?? null
    : null

  // Curators that appear on at least one lecture (deduplicated by id)
  const filterCurators: CuratorEntry[] = Array.from(
    new Map(
      lectures.flatMap((l) => l.curator.value).map((c) => [c.id, c])
    ).values()
  )

  function handleToggleCurator(id: number) {
    setSelectedCuratorIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleClearAll() {
    setSelectedCuratorIds(new Set())
  }

  const filteredLectures = selectedCuratorIds.size === 0
    ? lectures
    : lectures.filter((l) => l.curator.value.some((c) => selectedCuratorIds.has(c.id)))

  const lecturesByDecision = new Map<string, Lecture[]>(
    meta.decisions.map((d: Decision) => [
      d.variant,
      filteredLectures.filter((l) => l.decision.variant === d.variant),
    ])
  )

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <h1 className="text-base font-semibold text-gray-800 flex-shrink-0">
          Ontico Kanban — TechLead
        </h1>
        <span className="text-sm text-gray-400 flex-shrink-0">
          {selectedCuratorIds.size > 0
            ? `${filteredLectures.length} / ${lectures.length} заявок`
            : `${lectures.length} заявок`}
        </span>
        <CuratorFilter
          curators={filterCurators}
          selectedIds={selectedCuratorIds}
          onToggle={handleToggleCurator}
          onClearAll={handleClearAll}
        />
      </header>

      {/* Board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={(e) => void handleDragEnd(e)}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3 h-full px-4 py-3" style={{ minWidth: 'max-content' }}>
            {meta.decisions.map((decision: Decision) => (
              <KanbanColumn
                key={decision.variant}
                decision={decision}
                lectures={lecturesByDecision.get(decision.variant) ?? []}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeLecture && (
            <div className="w-64 rotate-2 opacity-90">
              <LectureCard lecture={activeLecture} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Toast error */}
      {toastError && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toastError}
        </div>
      )}
    </div>
  )
}

import type { CuratorEntry } from '../types/api'

interface CuratorFilterProps {
  curators: CuratorEntry[]
  selectedIds: Set<number>
  onToggle: (id: number) => void
  onClearAll: () => void
}

function FilterAvatar({ curator, selected, onToggle }: {
  curator: CuratorEntry
  selected: boolean
  onToggle: (id: number) => void
}) {
  const initials = curator.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const avatarUrl = curator.avatar ? `https://conf.ontico.ru${curator.avatar}` : null

  return (
    <button
      title={curator.name}
      onClick={() => onToggle(curator.id)}
      className={[
        'w-8 h-8 rounded-full border-2 overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center transition-all',
        selected
          ? 'border-blue-500 ring-2 ring-blue-400 ring-offset-1 opacity-100'
          : 'border-white opacity-70 hover:opacity-100',
      ].join(' ')}
    >
      {avatarUrl && (
        <img src={avatarUrl} alt={curator.name} className="w-full h-full object-cover" />
      )}
      {!avatarUrl && (
        <span className="text-xs font-medium text-blue-700">{initials}</span>
      )}
    </button>
  )
}

export function CuratorFilter({ curators, selectedIds, onToggle, onClearAll }: CuratorFilterProps) {
  if (curators.length === 0) return null

  const hasSelection = selectedIds.size > 0

  return (
    <div className="flex items-center gap-2 overflow-x-auto flex-shrink-0">
      <button
        onClick={onClearAll}
        disabled={!hasSelection}
        className={[
          'text-xs px-2 py-1 rounded-md border flex-shrink-0 transition-colors',
          hasSelection
            ? 'border-blue-300 text-blue-600 hover:bg-blue-50 cursor-pointer'
            : 'border-gray-200 text-gray-300 cursor-default',
        ].join(' ')}
      >
        Все
      </button>
      <div className="flex items-center gap-1">
        {curators.map((curator) => (
          <FilterAvatar
            key={curator.id}
            curator={curator}
            selected={selectedIds.has(curator.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}

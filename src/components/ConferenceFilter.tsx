import type { Conference, ConferenceSection } from '../types/api'

interface ConferenceFilterProps {
  conferences: Conference[]
  sections: ConferenceSection[]
  selectedConferenceId: number | null
  selectedSectionId: number | null
  onConferenceChange: (id: number | null) => void
  onSectionChange: (id: number | null) => void
}

const SELECT_CLASS =
  'text-sm border border-gray-200 rounded px-2 py-1 text-gray-700 bg-white flex-shrink-0 max-w-64'

export function ConferenceFilter({
  conferences,
  sections,
  selectedConferenceId,
  selectedSectionId,
  onConferenceChange,
  onSectionChange,
}: ConferenceFilterProps) {
  // При выбранной конференции список короткий и однородный — группировка не нужна.
  // В режиме «Все конференции» без неё названия секций неотличимы по принадлежности.
  const sectionOptions = selectedConferenceId !== null
    ? sections
        .filter((s) => s.conference_id === selectedConferenceId)
        .map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
    : conferences.map((conference) => (
        <optgroup key={conference.id} label={conference.name}>
          {sections
            .filter((s) => s.conference_id === conference.id)
            .map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </optgroup>
      ))

  return (
    <>
      <select
        value={selectedConferenceId ?? ''}
        onChange={(e) => onConferenceChange(e.target.value ? Number(e.target.value) : null)}
        className={SELECT_CLASS}
      >
        <option value="">Все конференции</option>
        {conferences.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select
        value={selectedSectionId ?? ''}
        onChange={(e) => onSectionChange(e.target.value ? Number(e.target.value) : null)}
        className={SELECT_CLASS}
      >
        <option value="">Все секции</option>
        {sectionOptions}
      </select>
    </>
  )
}

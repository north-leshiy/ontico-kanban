import type { GetInfoResult } from '../types/api'
import type { BoardPreferences } from '../storage/preferences'

/**
 * Сопоставляет сохранённый выбор с актуальными метаданными.
 *
 * Конференция, которой больше нет в `conferences`, откатывает выбор к дефолту —
 * первой доступной конференции и всем её секциям. Секция, которой нет в
 * `conference_sections` или которая принадлежит другой конференции, сбрасывается
 * в «Все секции», не трогая конференцию.
 */
export function resolveSelection(
  meta: GetInfoResult,
  stored: BoardPreferences | null
): BoardPreferences {
  const fallback: BoardPreferences = {
    conferenceId: meta.conferences[0]?.id ?? null,
    sectionId: null,
  }

  if (!stored) return fallback

  const conferenceExists =
    stored.conferenceId === null ||
    meta.conferences.some((c) => c.id === stored.conferenceId)
  if (!conferenceExists) return fallback

  const section = meta.conference_sections.find((s) => s.id === stored.sectionId)
  const sectionMatchesConference =
    section !== undefined &&
    (stored.conferenceId === null || section.conference_id === stored.conferenceId)

  return {
    conferenceId: stored.conferenceId,
    sectionId: sectionMatchesConference ? stored.sectionId : null,
  }
}

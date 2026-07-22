const STORAGE_KEY = 'boardPreferences'

export interface BoardPreferences {
  conferenceId: number | null
  sectionId: number | null
}

function isBoardPreferences(value: unknown): value is BoardPreferences {
  if (typeof value !== 'object' || value === null) return false
  const { conferenceId, sectionId } = value as Record<string, unknown>
  const isIdOrNull = (v: unknown) => v === null || typeof v === 'number'
  return isIdOrNull(conferenceId) && isIdOrNull(sectionId)
}

/** Returns null if nothing was saved yet or storage is unavailable. */
export async function loadPreferences(): Promise<BoardPreferences | null> {
  try {
    const stored = await chrome.storage.local.get(STORAGE_KEY)
    const value = stored[STORAGE_KEY]
    return isBoardPreferences(value) ? value : null
  } catch {
    return null
  }
}

export async function savePreferences(prefs: BoardPreferences): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: prefs })
  } catch {
    // Выбор не сохранился — доска продолжает работать с текущим состоянием
  }
}

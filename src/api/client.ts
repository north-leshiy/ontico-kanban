import type { GetInfoResult, GetInfoResponse, Lecture, LecturesResponse } from '../types/api'

const BASE_URL = 'https://conf.ontico.ru'
const TECHLEAD_SECTION_ID = 10634778
const PER_PAGE = 100

// ── Error types ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly code: 'UNAUTHORIZED' | 'API_ERROR' | 'NETWORK_ERROR',
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Message proxy via background service worker ───────────────────────────────

async function apiFetch<T>(url: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const response = await chrome.runtime.sendMessage({
    type: 'FETCH',
    url: `${BASE_URL}${url}`,
    method,
    body,
  })

  if (response?.error === 'UNAUTHORIZED') {
    throw new ApiError('UNAUTHORIZED', 'Необходимо авторизоваться на conf.ontico.ru')
  }
  if (response?.error) {
    throw new ApiError('API_ERROR', String(response.error))
  }
  return response.data as T
}

// ── get_info: metadata (decisions, curators, sections) ───────────────────────

let getInfoCache: GetInfoResult | null = null

export async function fetchGetInfo(): Promise<GetInfoResult> {
  if (getInfoCache) return getInfoCache
  const data = await apiFetch<GetInfoResponse>('/api/lectures/get_info.json?archive=0', 'GET')
  getInfoCache = data.result
  return getInfoCache
}

// ── moderate2: paginated lecture list ─────────────────────────────────────────

async function fetchLecturesPage(page: number): Promise<Lecture[]> {
  const data = await apiFetch<LecturesResponse>(
    `/api/lectures/moderate2.json?page=${page}&per_page=${PER_PAGE}&archive=0`,
    'POST',
    {
      filters: {
        statuses: [],
        conferences: [],
        dates: [],
        sections: [TECHLEAD_SECTION_ID],
        decisions: [],
        curators: [],
        stages: [],
        company_search: '',
        search: '',
        is_partner: false,
        isWithoutCurator: false,
        assigned_to_me: false,
        fasttrack: false,
      },
      sorts: {
        conferenceDate: null,
        submissionDate: null,
        section: null,
        status: null,
        speaker: null,
        company: null,
        curator: null,
      },
    }
  )
  return data.result.lectures
}

export async function fetchAllTechLeadLectures(): Promise<Lecture[]> {
  const all: Lecture[] = []
  let page = 1

  while (true) {
    const lectures = await fetchLecturesPage(page)
    all.push(...lectures)
    if (lectures.length < PER_PAGE) break
    page++
  }

  return all
}

// ── set decision ──────────────────────────────────────────────────────────────

export async function setDecision(lectureId: number, decisionVariant: string): Promise<void> {
  await apiFetch('/api/lectures/moderate2.json', 'POST', {
    set: { id: lectureId, decision: decisionVariant },
  })
}

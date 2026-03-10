// ── get_info.json types ──────────────────────────────────────────────────────

export interface Decision {
  id: number
  variant: string
  name: string
}

export interface Curator {
  id: number
  name: string
  avatar: string
  conferences: number[]
}

export interface ConferenceSection {
  id: number
  name: string
  conference_id: number
}

export interface Stage {
  id: number
  variant: string
  name: string
}

export interface Status {
  id: number
  name: string
}

export interface Conference {
  id: number
  name: string
  webname: string
}

export interface GetInfoResult {
  decisions: Decision[]
  curators: Curator[]
  conference_sections: ConferenceSection[]
  stages: Stage[]
  statuses: Status[]
  conferences: Conference[]
}

export interface GetInfoResponse {
  status: ApiStatus
  result: GetInfoResult
}

// ── moderate2.json types ─────────────────────────────────────────────────────

export interface ApiStatus {
  valid_to: string
  messages: string[]
  name: string
}

export interface LectureFieldShow<T = string> {
  variant: string | null
  mode: 'show' | 'hide' | 'edit'
  value: T | null
}

export interface SpeakerEntry {
  id: number
  value: string
  is_main: boolean
}

export interface SpeakersField {
  speakers: SpeakerEntry[]
  fasttrek: {
    mode: string
    value: boolean
  }
}

export interface SectionField {
  value: number
  name: string
}

export interface ConferenceField {
  value: number
  name: string
}

export interface CompanyField {
  value: string
  partner: {
    mode: string
    value: boolean
  }
}

export interface DecisionField {
  variant: string
  mode: 'edit' | 'show' | 'hide'
  value: string
}

export interface CuratorEntry {
  id: number
  name: string
  avatar: string
}

export interface CuratorField {
  variant: string
  mode: 'edit' | 'show' | 'hide'
  value: CuratorEntry[]
}

export interface TitleField {
  id: number
  value: string
}

export interface VotingField {
  like: number
  dislike: number
}

export interface Lecture {
  id: number
  title: TitleField
  speakers: SpeakersField
  decision: DecisionField
  curator: CuratorField
  section: SectionField
  conference: ConferenceField
  company: CompanyField
  status: LectureFieldShow<string>
  date: { value: string }
  voting: VotingField
  role: string
}

export interface LecturesResult {
  lectures: Lecture[]
  sort: Record<string, string | null>
}

export interface LecturesResponse {
  status: ApiStatus
  result: LecturesResult
}

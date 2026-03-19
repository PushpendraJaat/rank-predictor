export interface Entry {
  id: string
  roll_number: string
  candidate_name: string
  raw_marks: number
  proportionate_marks: number
  cancelled_questions: number
  shift_id: ShiftId
  category: Category
  created_at: string
}

export interface EntryWithRank extends Entry {
  shift_rank: number
  shift_percentile: number
  z_score: number
  t_score: number
  merit_rank: number
}

export type ShiftId = 'day1_morning' | 'day1_evening' | 'day2_morning' | 'day2_evening'
export type Category = 'UR' | 'OBC' | 'SC' | 'ST' | 'EWS'

export const SHIFTS: { id: ShiftId; label: string }[] = [
  { id: 'day1_morning', label: 'Day 1 - Morning' },
  { id: 'day1_evening', label: 'Day 1 - Evening' },
  { id: 'day2_morning', label: 'Day 2 - Morning' },
  { id: 'day2_evening', label: 'Day 2 - Evening' },
]

export const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id: 'UR', label: 'Unreserved', color: 'bg-blue-100 text-blue-800' },
  { id: 'OBC', label: 'OBC', color: 'bg-green-100 text-green-800' },
  { id: 'SC', label: 'SC', color: 'bg-orange-100 text-orange-800' },
  { id: 'ST', label: 'ST', color: 'bg-purple-100 text-purple-800' },
  { id: 'EWS', label: 'EWS', color: 'bg-yellow-100 text-yellow-800' },
]

export const MIN_ENTRIES_FOR_MERIT = 1000

import type { Entry, EntryWithRank, ShiftId } from '@/lib/types'

/**
 * Standard Normal Inverse (NORMSINV) implementation
 * Returns the inverse of the standard normal cumulative distribution
 * Based on Abramowitz and Stegun approximation
 */
export function normsinv(p: number): number {
  // Handle edge cases
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity
  if (p === 0.5) return 0

  const a1 = -3.969683028665376e1
  const a2 = 2.209460984245205e2
  const a3 = -2.759285104469687e2
  const a4 = 1.383577518672690e2
  const a5 = -3.066479806614716e1
  const a6 = 2.506628277459239e0

  const b1 = -5.447609879822406e1
  const b2 = 1.615858368580409e2
  const b3 = -1.556989798598866e2
  const b4 = 6.680131188771972e1
  const b5 = -1.328068155288572e1

  const c1 = -7.784894002430293e-3
  const c2 = -3.223964580411365e-1
  const c3 = -2.400758277161838e0
  const c4 = -2.549732539343734e0
  const c5 = 4.374664141464968e0
  const c6 = 2.938163982698783e0

  const d1 = 7.784695709041462e-3
  const d2 = 3.224671290700398e-1
  const d3 = 2.445134137142996e0
  const d4 = 3.754408661907416e0

  const pLow = 0.02425
  const pHigh = 1 - pLow

  let q: number, r: number

  if (p < pLow) {
    // Rational approximation for lower region
    q = Math.sqrt(-2 * Math.log(p))
    return (
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    )
  } else if (p <= pHigh) {
    // Rational approximation for central region
    q = p - 0.5
    r = q * q
    return (
      ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
    )
  } else {
    // Rational approximation for upper region
    q = Math.sqrt(-2 * Math.log(1 - p))
    return (
      -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    )
  }
}

/**
 * Calculate percentile within a shift
 * P = (candidates with score <= current) / total * 100
 */
export function calculatePercentile(score: number, allScores: number[]): number {
  const sortedScores = [...allScores].sort((a, b) => a - b)
  const countLessOrEqual = sortedScores.filter((s) => s <= score).length
  return (countLessOrEqual / sortedScores.length) * 100
}

/**
 * Calculate Z-score from percentile using NORMSINV
 * Apply small adjustment to avoid infinity at edges
 */
export function calculateZScore(percentile: number): number {
  // Adjust percentile to avoid infinity (use p - 0.005 as per NEP formula)
  let p = percentile / 100
  
  // Clamp to avoid exact 0 or 1
  p = Math.max(0.001, Math.min(0.999, p - 0.005))
  
  return normsinv(p)
}

/**
 * Calculate T-score from Z-score
 * T = AM + (ASD × Z) where AM=50, ASD=10
 */
export function calculateTScore(zScore: number): number {
  const AM = 50 // Assumed Mean
  const ASD = 10 // Assumed Standard Deviation
  return AM + ASD * zScore
}

/**
 * Group entries by shift
 */
export function groupByShift(entries: Entry[]): Record<ShiftId, Entry[]> {
  return entries.reduce(
    (acc, entry) => {
      if (!acc[entry.shift_id]) {
        acc[entry.shift_id] = []
      }
      acc[entry.shift_id].push(entry)
      return acc
    },
    {} as Record<ShiftId, Entry[]>
  )
}

/**
 * Calculate full NEP scores for all entries
 */
export function calculateNEPScores(entries: Entry[]): EntryWithRank[] {
  const byShift = groupByShift(entries)

  // Calculate shift-wise rankings and percentiles
  const withShiftData: (Entry & {
    shift_rank: number
    shift_percentile: number
    z_score: number
    t_score: number
  })[] = []

  for (const shiftId of Object.keys(byShift) as ShiftId[]) {
    const shiftEntries = byShift[shiftId]
    const shiftScores = shiftEntries.map((e) => e.proportionate_marks)

    // Sort by proportionate marks descending
    const sorted = [...shiftEntries].sort(
      (a, b) => b.proportionate_marks - a.proportionate_marks
    )

    sorted.forEach((entry, index) => {
      const percentile = calculatePercentile(entry.proportionate_marks, shiftScores)
      const zScore = calculateZScore(percentile)
      const tScore = calculateTScore(zScore)

      withShiftData.push({
        ...entry,
        shift_rank: index + 1,
        shift_percentile: percentile,
        z_score: zScore,
        t_score: tScore,
      })
    })
  }

  // Sort by T-score descending for final merit rank
  const sortedByTScore = [...withShiftData].sort((a, b) => b.t_score - a.t_score)

  // Assign merit ranks
  return sortedByTScore.map((entry, index) => ({
    ...entry,
    merit_rank: index + 1,
  }))
}

/**
 * Get shift-wise leaderboard (ranked by raw marks within shift)
 */
export function getShiftLeaderboard(entries: Entry[], shiftId: ShiftId): (Entry & { rank: number })[] {
  const shiftEntries = entries.filter((e) => e.shift_id === shiftId)
  const sorted = [...shiftEntries].sort(
    (a, b) => b.proportionate_marks - a.proportionate_marks
  )
  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }))
}

'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { calculateNEPScores, getShiftLeaderboard } from '@/lib/nep/calculations'
import { SHIFTS, CATEGORIES, MIN_ENTRIES_FOR_MERIT, type Entry, type EntryWithRank } from '@/lib/types'
import {
  Trophy,
  BarChart3,
  TrendingUp,
  Users,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'

async function fetchEntries(): Promise<Entry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('proportionate_marks', { ascending: false })

  if (error) throw error
  return data || []
}

interface PageProps {
  params: Promise<{ rollNumber: string }>
}

export default function UserDashboardPage({ params }: PageProps) {
  const { rollNumber } = use(params)
  const decodedRollNumber = decodeURIComponent(rollNumber).toUpperCase()

  const { data: entries, isLoading, error } = useSWR('entries', fetchEntries, {
    refreshInterval: 30000,
  })

  const totalCount = entries?.length || 0
  const isLocked = totalCount < MIN_ENTRIES_FOR_MERIT

  // Find user's entry
  const userEntry = entries?.find(
    (e) => e.roll_number.toUpperCase() === decodedRollNumber
  )

  // Calculate all NEP scores
  const rankedEntries = useMemo(() => {
    if (!entries || entries.length === 0) return []
    return calculateNEPScores(entries)
  }, [entries])

  // Get user's ranked entry
  const userRankedEntry = rankedEntries.find(
    (e) => e.roll_number.toUpperCase() === decodedRollNumber
  )

  // Get shift leaderboard position
  const shiftLeaderboard = useMemo(() => {
    if (!entries || !userEntry) return null
    const leaderboard = getShiftLeaderboard(entries, userEntry.shift_id)
    const position = leaderboard.findIndex(
      (e) => e.roll_number.toUpperCase() === decodedRollNumber
    )
    return {
      rank: position + 1,
      total: leaderboard.length,
    }
  }, [entries, userEntry, decodedRollNumber])

  // Get category rank
  const categoryRank = useMemo(() => {
    if (!userRankedEntry) return null
    const categoryEntries = rankedEntries.filter(
      (e) => e.category === userRankedEntry.category
    )
    const position = categoryEntries.findIndex(
      (e) => e.roll_number.toUpperCase() === decodedRollNumber
    )
    return {
      rank: position + 1,
      total: categoryEntries.length,
    }
  }, [rankedEntries, userRankedEntry, decodedRollNumber])

  const getShiftLabel = (shiftId: string) => {
    return SHIFTS.find((s) => s.id === shiftId)?.label || shiftId
  }

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
              <p className="text-muted-foreground mb-4">
                Failed to fetch entries. Please try again later.
              </p>
              <Button asChild>
                <Link href="/my-rank">Try Again</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!userEntry) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="size-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Entry Not Found</h2>
              <p className="text-muted-foreground mb-4">
                No entry found for roll number:{' '}
                <span className="font-mono font-semibold">{decodedRollNumber}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/submit">Submit Your Entry</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/my-rank">
                    <ArrowLeft className="size-4 mr-2" />
                    Search Again
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const categoryInfo = getCategoryInfo(userEntry.category)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/my-rank">
              <ArrowLeft className="size-4" />
              Search Different Roll Number
            </Link>
          </Button>

          {/* User Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{userEntry.candidate_name}</CardTitle>
                  <CardDescription className="font-mono text-base mt-1">
                    {userEntry.roll_number}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{getShiftLabel(userEntry.shift_id)}</Badge>
                  {categoryInfo && (
                    <Badge variant="outline" className={categoryInfo.color}>
                      {categoryInfo.label}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Raw Marks</p>
                  <p className="text-3xl font-bold">
                    {Number(userEntry.raw_marks).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Proportionate Marks</p>
                  <p className="text-3xl font-bold text-primary">
                    {Number(userEntry.proportionate_marks).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rank Cards */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {/* Shift Rank */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="size-4 text-yellow-500" />
                  Shift Rank
                </CardTitle>
                <CardDescription>
                  Your position within {getShiftLabel(userEntry.shift_id)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{shiftLeaderboard?.rank || '-'}</span>
                  <span className="text-muted-foreground">
                    / {shiftLeaderboard?.total || '-'}
                  </span>
                </div>
                <Button variant="link" className="px-0 mt-2" asChild>
                  <Link href="/leaderboard">View Full Shift Leaderboard</Link>
                </Button>
              </CardContent>
            </Card>

            {/* NEP Merit Rank */}
            <Card className={isLocked ? 'opacity-75' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="size-4 text-primary" />
                  NEP Merit Rank
                  {isLocked && <Clock className="size-4 text-muted-foreground" />}
                </CardTitle>
                <CardDescription>
                  {isLocked
                    ? 'Locked until 1000 entries'
                    : 'Your estimated overall merit position'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLocked ? (
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <span className="text-2xl font-bold">--</span>
                      <span>/ {totalCount}</span>
                    </div>
                    <Progress
                      value={(totalCount / MIN_ENTRIES_FOR_MERIT) * 100}
                      className="h-2 mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {MIN_ENTRIES_FOR_MERIT - totalCount} more entries needed
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">
                        {userRankedEntry?.merit_rank || '-'}
                      </span>
                      <span className="text-muted-foreground">/ {rankedEntries.length}</span>
                    </div>
                    <Button variant="link" className="px-0 mt-2" asChild>
                      <Link href="/merit">View Full Merit List</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats (only when unlocked) */}
          {!isLocked && userRankedEntry && (
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Shift Percentile</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {userRankedEntry.shift_percentile.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Better than {userRankedEntry.shift_percentile.toFixed(0)}% in your shift
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    T-Score
                    <TrendingUp className="size-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    {userRankedEntry.t_score.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Normalized NEP score</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="size-4" />
                    Category Rank ({userEntry.category})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{categoryRank?.rank || '-'}</span>
                    <span className="text-muted-foreground">/ {categoryRank?.total || '-'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Among {categoryInfo?.label} candidates
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Success Message */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="size-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Entry Recorded Successfully</h3>
                  <p className="text-sm text-muted-foreground">
                    Your marks have been added to the prediction system. Rankings update in
                    real-time as more candidates submit their entries.
                    {isLocked &&
                      ' The full NEP merit list will unlock once we reach 1000 entries.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

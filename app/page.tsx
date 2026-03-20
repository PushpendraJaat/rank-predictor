'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { SHIFTS, MIN_ENTRIES_FOR_MERIT, type Entry } from '@/lib/types'
import {
  FileText,
  Trophy,
  BarChart3,
  User,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react'

async function fetchStats(): Promise<{
  total: number
  byShift: Record<string, number>
  recentEntries: Entry[]
}> {
  const supabase = createClient()

  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  const total = entries?.length || 0
  const byShift: Record<string, number> = {}

  SHIFTS.forEach((shift) => {
    byShift[shift.id] = entries?.filter((e) => e.shift_id === shift.id).length || 0
  })

  return {
    total,
    byShift,
    recentEntries: (entries || []).slice(0, 5),
  }
}

export default function HomePage() {
  const { data: stats, isLoading, error } = useSWR('stats', fetchStats, {
    refreshInterval: 10000, // Refresh every 10 seconds
  })

  const progress = stats
    ? Math.min((stats.total / MIN_ENTRIES_FOR_MERIT) * 100, 100)
    : 0
  const remaining = stats ? Math.max(MIN_ENTRIES_FOR_MERIT - stats.total, 0) : MIN_ENTRIES_FOR_MERIT
  const isUnlocked = stats && stats.total >= MIN_ENTRIES_FOR_MERIT

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            MP ITI Training Officer 2026
            <br />
            <span className="text-primary">COPA Trade - NEP Rank Predictor</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Predict your merit rank for <strong>COPA (Computer Operator and Programming Assistant)</strong> trade 
            using the official Normalised Equi-Percentile (NEP) scoring method. Submit your marks and compare 
            rankings across all shifts fairly.
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-primary/10 rounded-lg text-sm font-medium text-primary">
            Only for COPA Trade Students
          </div>
        </section>

        {/* Progress Card */}
        <Card className="mb-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Community Progress
            </CardTitle>
            <CardDescription>
              Merit list unlocks at {MIN_ENTRIES_FOR_MERIT.toLocaleString()} entries for accurate
              statistical analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-32" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-primary">
                        <CheckCircle2 className="size-4" />
                        Merit List Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="size-4" />
                        {remaining.toLocaleString()} more entries needed
                      </span>
                    )}
                  </span>
                  <span className="font-semibold">
                    {stats?.total.toLocaleString() || 0} / {MIN_ENTRIES_FOR_MERIT.toLocaleString()}
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {progress.toFixed(1)}% of target reached
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                Submit Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Add your marks to the prediction system
              </p>
              <Button asChild className="w-full">
                <Link href="/submit">
                  Submit Now
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="size-5 text-yellow-500" />
                Shift Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View rankings within each shift
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/leaderboard">
                  View Leaderboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-md transition-shadow ${!isUnlocked ? 'opacity-75' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" />
                Merit List
                {!isUnlocked && <Clock className="size-4 text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {isUnlocked ? 'View NEP-based merit rankings' : 'Locked until 1000 entries'}
              </p>
              <Button variant="outline" asChild className="w-full" disabled={!isUnlocked}>
                <Link href="/merit">
                  View Merit List
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="size-5" />
                My Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Check your estimated merit position
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/my-rank">
                  Check Rank
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Shift-wise Stats */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Entries by Shift</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {SHIFTS.map((shift) => (
              <Card key={shift.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{shift.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">
                        {stats?.byShift[shift.id] || 0}
                      </span>
                      <span className="text-muted-foreground text-sm">entries</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">How NEP Scoring Works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-2">
                  1
                </div>
                <CardTitle className="text-base">Calculate Percentile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your position relative to other candidates in your exam shift is calculated as a
                  percentile score.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-2">
                  2
                </div>
                <CardTitle className="text-base">Convert to Z-Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Percentile is converted to Z-Score using the inverse normal distribution function
                  (NORMSINV).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-2">
                  3
                </div>
                <CardTitle className="text-base">Compute T-Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Final T-Score = 50 + (10 x Z-Score), providing a normalized score for fair
                  cross-shift comparison.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Entries */}
        {stats && stats.recentEntries.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="size-5" />
              Recent Entries
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {stats.recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{entry.candidate_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {SHIFTS.find((s) => s.id === entry.shift_id)?.label}
                        </p>
                      </div>
                      {/* <div className="text-right">
                        <p className="font-semibold">
                          {Number(entry.proportionate_marks).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Proportionate Marks
                        </p>
                      </div> */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>
            This is a community-driven rank prediction tool. Actual results may vary.
          </p>
          <p className="mt-1">
            Submit your marks to help improve prediction accuracy for everyone.
          </p>
        </div>
      </footer>
    </div>
  )
}

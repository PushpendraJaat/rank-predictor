'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Header } from '@/components/header'
import { MeritTable } from '@/components/merit-table'
import { CategoryFilter } from '@/components/category-filter'
import { LockOverlay } from '@/components/lock-overlay'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { calculateNEPScores } from '@/lib/nep/calculations'
import { MIN_ENTRIES_FOR_MERIT, type Entry, type Category } from '@/lib/types'
import { Search } from 'lucide-react'

async function fetchEntries(): Promise<Entry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('proportionate_marks', { ascending: false })

  if (error) throw error
  return data || []
}

export default function LeaderboardTable() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: entries, isLoading, error } = useSWR('entries', fetchEntries, {
    refreshInterval: 30000,
  })

  const totalCount = entries?.length || 0
  const isLocked = totalCount < MIN_ENTRIES_FOR_MERIT

  // 🔒 FULL PAGE LOCK (IMPORTANT)
  if (isLocked) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl">
                  🔒 Merit List Locked
                </CardTitle>
                <CardDescription>
                  Merit list, shift toppers and rankings will be revealed after
                  <br />
                  <b>{MIN_ENTRIES_FOR_MERIT} entries</b>
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Progress */}
                <div className="mb-4">
                  <div className="text-lg font-semibold">
                    {totalCount} / {MIN_ENTRIES_FOR_MERIT}
                  </div>

                  <div className="w-full bg-muted rounded-full h-3 mt-2">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (totalCount / MIN_ENTRIES_FOR_MERIT) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-3">
                  Submit your marks to help unlock the leaderboard 🚀
                </p>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    )
  }

  // ✅ NORMAL FLOW AFTER UNLOCK

  const rankedEntries = useMemo(() => {
    if (!entries || entries.length === 0) return []
    return calculateNEPScores(entries)
  }, [entries])

  const filteredEntries = useMemo(() => {
    return rankedEntries
      .filter((e) => selectedCategory === 'all' || e.category === selectedCategory)
      .filter(
        (e) =>
          !searchQuery ||
          e.candidate_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [rankedEntries, selectedCategory, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Final Merit List (NEP Scoring)
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <CategoryFilter
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>NEP Merit Rankings</CardTitle>
            <CardDescription>
              {filteredEntries.length} entries
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load merit list
              </div>
            ) : (
              <MeritTable entries={filteredEntries} />
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
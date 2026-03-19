'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Header } from '@/components/header'
import LeaderboardTable from '@/components/leaderboard-table'
import { CategoryFilter } from '@/components/category-filter'
import { ShiftSelector } from '@/components/shift-selector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { SHIFTS, type Entry, type ShiftId, type Category } from '@/lib/types'
import { Users } from 'lucide-react'

async function fetchEntries(): Promise<Entry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('proportionate_marks', { ascending: false })

  if (error) throw error
  return data || []
}

export default function LeaderboardPage() {
  const [selectedShift, setSelectedShift] = useState<ShiftId | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')

  const { data: entries, isLoading, error } = useSWR('entries', fetchEntries, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  const filteredEntries = entries
    ?.filter((e) => selectedShift === 'all' || e.shift_id === selectedShift)
    .filter((e) => selectedCategory === 'all' || e.category === selectedCategory)
    .map((e, index) => ({ ...e, rank: index + 1 })) || []

  // Get stats per shift
  const shiftStats = SHIFTS.map((shift) => {
    const count = entries?.filter((e) => e.shift_id === shift.id).length || 0
    const topScore = entries
      ?.filter((e) => e.shift_id === shift.id)
      .sort((a, b) => b.proportionate_marks - a.proportionate_marks)[0]
    return {
      ...shift,
      count,
      topScore: topScore?.proportionate_marks,
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Shift-wise Leaderboard</h1>
          <p className="text-muted-foreground">
            View rankings within each shift based on proportionate marks
          </p>
        </div>

        {/* Shift Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {shiftStats.map((shift) => (
            <Card
              key={shift.id}
              className={`cursor-pointer transition-colors ${
                selectedShift === shift.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedShift(shift.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{shift.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {isLoading ? <Skeleton className="h-8 w-12" /> : shift.count}
                    </span>
                  </div>
                  {shift.topScore && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Top Score</p>
                      <p className="text-lg font-semibold text-primary">
                        {Number(shift.topScore).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <ShiftSelector
            value={selectedShift}
            onChange={setSelectedShift}
            includeAll
          />
          <CategoryFilter
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedShift === 'all'
                ? 'All Shifts'
                : SHIFTS.find((s) => s.id === selectedShift)?.label}
            </CardTitle>
            <CardDescription>
              {filteredEntries.length} entries
              {selectedCategory !== 'all' && ` (${selectedCategory} category)`}
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
                Failed to load leaderboard. Please try again.
              </div>
            ) : (
              <LeaderboardTable
                entries={filteredEntries}
                showShift={selectedShift === 'all'}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

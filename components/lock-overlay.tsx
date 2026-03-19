'use client'

import Link from 'next/link'
import { Lock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MIN_ENTRIES_FOR_MERIT } from '@/lib/types'

interface LockOverlayProps {
  currentCount: number
}

export function LockOverlay({ currentCount }: LockOverlayProps) {
  const progress = Math.min((currentCount / MIN_ENTRIES_FOR_MERIT) * 100, 100)
  const remaining = MIN_ENTRIES_FOR_MERIT - currentCount

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <div className="text-center p-8 max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Lock className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Merit List Locked</h3>
        <p className="text-muted-foreground mb-6">
          The NEP-based merit list requires at least {MIN_ENTRIES_FOR_MERIT.toLocaleString()}{' '}
          entries for accurate statistical calculations.
        </p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Users className="size-4" />
              Current Entries
            </span>
            <span className="font-semibold">
              {currentCount.toLocaleString()} / {MIN_ENTRIES_FOR_MERIT.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {remaining > 0
              ? `${remaining.toLocaleString()} more entries needed`
              : 'Threshold reached!'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/submit">Submit Your Entry</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/leaderboard">View Shift Leaderboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

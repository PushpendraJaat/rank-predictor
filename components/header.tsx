import Link from 'next/link'
import { BarChart3, FileText, Trophy, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BarChart3 className="size-5 text-primary" />
          <span className="hidden sm:inline">MP ITI TO 2026 - COPA</span>
          <span className="sm:hidden">COPA Predictor</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/submit">
              <FileText className="size-4" />
              <span className="hidden sm:inline">Submit</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/leaderboard">
              <Trophy className="size-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/merit">
              <BarChart3 className="size-4" />
              <span className="hidden sm:inline">Merit</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/my-rank">
              <User className="size-4" />
              <span className="hidden sm:inline">My Rank</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

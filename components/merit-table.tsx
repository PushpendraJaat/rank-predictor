'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CATEGORIES, SHIFTS, type EntryWithRank, type Category } from '@/lib/types'
import { Trophy, Medal, Award, Info } from 'lucide-react'

interface MeritTableProps {
  entries: EntryWithRank[]
}

function getCategoryBadge(category: Category) {
  const cat = CATEGORIES.find((c) => c.id === category)
  if (!cat) return null
  return (
    <Badge variant="outline" className={cat.color}>
      {cat.id}
    </Badge>
  )
}

function getShiftLabel(shiftId: string) {
  const shift = SHIFTS.find((s) => s.id === shiftId)
  return shift?.label || shiftId
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="size-5 text-yellow-500" />
  if (rank === 2) return <Medal className="size-5 text-gray-400" />
  if (rank === 3) return <Award className="size-5 text-amber-600" />
  return null
}

function maskRollNumber(rollNumber: string): string {
  if (rollNumber.length <= 4) return '****'
  return '****' + rollNumber.slice(-4)
}

export function MeritTable({ entries }: MeritTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No entries found for this selection
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Roll No.</TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-1">
                T-Score
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="size-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>T-Score = 50 + (10 x Z-Score)</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Normalized score using NEP method for cross-shift comparison
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TableHead>
            <TableHead className="text-right hidden md:table-cell">
              <div className="flex items-center justify-end gap-1">
                Percentile
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="size-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of candidates with lower scores in the same shift</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TableHead>
            <TableHead className="hidden lg:table-cell">Shift</TableHead>
            <TableHead className="hidden sm:table-cell">Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.merit_rank)}
                  <span className={entry.merit_rank <= 3 ? 'font-bold' : ''}>
                    {entry.merit_rank}
                  </span>
                </div>
              </TableCell>
              <TableCell className="truncate max-w-[150px]">
                {entry.candidate_name}
              </TableCell>
              <TableCell className="hidden sm:table-cell font-mono text-sm text-muted-foreground">
                {maskRollNumber(entry.roll_number)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {entry.t_score.toFixed(2)}
              </TableCell>
              <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                {entry.shift_percentile.toFixed(2)}%
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                {getShiftLabel(entry.shift_id)}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {getCategoryBadge(entry.category)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  )
}

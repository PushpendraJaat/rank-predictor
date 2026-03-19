'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SHIFTS, type ShiftId } from '@/lib/types'

interface ShiftSelectorProps {
  value: ShiftId | 'all'
  onChange: (shift: ShiftId | 'all') => void
  includeAll?: boolean
}

export function ShiftSelector({
  value,
  onChange,
  includeAll = true,
}: ShiftSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder="Select shift" />
      </SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value="all">All Shifts</SelectItem>}
        {SHIFTS.map((shift) => (
          <SelectItem key={shift.id} value={shift.id}>
            {shift.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CATEGORIES, type Category } from '@/lib/types'

interface CategoryFilterProps {
  selected: Category | 'all'
  onChange: (category: Category | 'all') => void
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('all')}
      >
        All Categories
      </Button>
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.id}
          variant={selected === cat.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(cat.id)}
          className={selected === cat.id ? '' : cat.color}
        >
          {cat.id}
        </Button>
      ))}
    </div>
  )
}

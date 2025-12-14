'use client'

import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFilter } from './FilterContext'
import { useSearchParams } from 'next/navigation'

export function FilterTrigger() {
    const { isOpen, toggle } = useFilter()
    const searchParams = useSearchParams()

    // Check if any filters are active to show the indicator
    const selectedCategory = searchParams.get('category')
    const timeRange = searchParams.get('time')
    const sort = searchParams.get('sort')
    const hasFilters = selectedCategory || timeRange || (sort && sort !== 'newest')

    return (
        <button
            onClick={toggle}
            className={cn(
                "flex-shrink-0 flex items-center gap-2 px-4 h-12 rounded-xl border transition-colors",
                isOpen || hasFilters
                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            )}
        >
            <Filter size={20} />
            <span className="font-medium hidden sm:inline">Filtros</span>
            {(hasFilters) && <div className="w-2 h-2 rounded-full bg-purple-500 ml-1" />}
        </button>
    )
}

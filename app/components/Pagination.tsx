'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PaginationProps {
    totalPages: number
    currentPage: number
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
    const searchParams = useSearchParams()

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', pageNumber.toString())
        return `?${params.toString()}`
    }

    if (totalPages <= 1) return null

    // Logic to show a window of pages (e.g., 1, ..., 4, 5, 6, ..., 10)
    // For simplicity, let's show all if < 7, otherwise show first, last, and window around current.

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <Link
                href={currentPage > 1 ? createPageURL(currentPage - 1) : '#'}
                className={cn(
                    "p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors",
                    currentPage <= 1
                        ? "text-zinc-300 dark:text-zinc-700 pointer-events-none"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
                aria-disabled={currentPage <= 1}
            >
                <ChevronLeft size={20} />
            </Link>

            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 px-2">
                Página {currentPage} de {totalPages}
            </span>

            <Link
                href={currentPage < totalPages ? createPageURL(currentPage + 1) : '#'}
                className={cn(
                    "p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors",
                    currentPage >= totalPages
                        ? "text-zinc-300 dark:text-zinc-700 pointer-events-none"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
                aria-disabled={currentPage >= totalPages}
            >
                <ChevronRight size={20} />
            </Link>
        </div>
    )
}

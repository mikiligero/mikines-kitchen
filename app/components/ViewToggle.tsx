'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Grid2x2, LayoutGrid, LayoutList, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

export type ViewMode = 'grid-lg' | 'grid-md' | 'row' | 'list' | 'rows-grid'

export function ViewToggle() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentView = (searchParams.get('view') as ViewMode) || 'grid-md'

    useEffect(() => {
        const viewParam = searchParams.get('view') as ViewMode

        // If we have a view in URL, sync to local storage
        if (viewParam) {
            localStorage.setItem('recipe-view-mode', viewParam)
        }
        // If no view in URL, try to restore from local storage
        else {
            const savedView = localStorage.getItem('recipe-view-mode') as ViewMode
            if (savedView) {
                const params = new URLSearchParams(searchParams.toString())
                params.set('view', savedView)
                router.replace(`/?${params.toString()}`)
            }
        }
    }, [searchParams, router])

    const setView = (view: ViewMode) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('view', view)
        router.push(`/?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button
                onClick={() => setView('grid-md')}
                className={cn(
                    "p-2 rounded-md transition-all hover:text-purple-600",
                    currentView === 'grid-md' ? "bg-white dark:bg-zinc-700 shadow-sm text-purple-600 dark:text-purple-300" : "text-zinc-500 dark:text-zinc-400"
                )}
                title="Cuadrícula"
            >
                <LayoutGrid size={20} />
            </button>
            <button
                onClick={() => setView('rows-grid')}
                className={cn(
                    "p-2 rounded-md transition-all hover:text-purple-600 hidden lg:block",
                    currentView === 'rows-grid' ? "bg-white dark:bg-zinc-700 shadow-sm text-purple-600 dark:text-purple-300" : "text-zinc-500 dark:text-zinc-400"
                )}
                title="Filas en Columnas"
            >
                <Grid2x2 size={20} />
            </button>
            <button
                onClick={() => setView('row')}
                className={cn(
                    "p-2 rounded-md transition-all hover:text-purple-600",
                    currentView === 'row' ? "bg-white dark:bg-zinc-700 shadow-sm text-purple-600 dark:text-purple-300" : "text-zinc-500 dark:text-zinc-400"
                )}
                title="Fila Detallada"
            >
                <LayoutList size={20} />
            </button>
            <button
                onClick={() => setView('list')}
                className={cn(
                    "p-2 rounded-md transition-all hover:text-purple-600",
                    currentView === 'list' ? "bg-white dark:bg-zinc-700 shadow-sm text-purple-600 dark:text-purple-300" : "text-zinc-500 dark:text-zinc-400"
                )}
                title="Lista Compacta"
            >
                <List size={20} />
            </button>
        </div>
    )
}

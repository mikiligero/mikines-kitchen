'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { X, Clock, ArrowUpDown, Tag, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFilter } from './FilterContext'
import { StarRating } from './StarRating'

interface FilterPanelProps {
    categories: { id: string; name: string }[]
}

export function FilterPanel({ categories }: FilterPanelProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { isOpen } = useFilter()

    const selectedCategory = searchParams.get('category') || ''
    const timeRange = searchParams.get('time') || ''
    const sort = searchParams.get('sort') || 'newest'

    const applyFilters = (newCategory: string, newTime: string, newSort: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (newCategory) params.set('category', newCategory)
        else params.delete('category')

        if (newTime) params.set('time', newTime)
        else params.delete('time')

        if (newSort && newSort !== 'newest') params.set('sort', newSort)
        else params.delete('sort')

        router.push(`/?${params.toString()}`)
    }

    const handleCategoryChange = (cat: string) => {
        const next = selectedCategory === cat ? '' : cat
        applyFilters(next, timeRange, sort)
    }

    const handleTimeChange = (range: string) => {
        const next = timeRange === range ? '' : range
        applyFilters(selectedCategory, next, sort)
    }

    const handleSortChange = (newSort: string) => {
        applyFilters(selectedCategory, timeRange, newSort)
    }

    const clearFilters = () => {
        router.push('/')
    }

    const hasFilters = selectedCategory || timeRange || sort !== 'newest' || searchParams.get('rating')

    if (!isOpen) return null

    return (
        <div className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Categories */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Tag size={16} /> Categoría
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.name)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-sm transition-colors border",
                                    selectedCategory === cat.name
                                        ? "bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                                        : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Clock size={16} /> Tiempo
                    </h3>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="time" checked={timeRange === 'short'} onChange={() => handleTimeChange('short')} className="accent-purple-600" />
                            <span className={cn("text-sm", timeRange === 'short' ? "text-purple-700 font-medium" : "text-zinc-600")}>Rápido (&lt; 30 min)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="time" checked={timeRange === 'medium'} onChange={() => handleTimeChange('medium')} className="accent-purple-600" />
                            <span className={cn("text-sm", timeRange === 'medium' ? "text-purple-700 font-medium" : "text-zinc-600")}>Medio (30 - 60 min)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="time" checked={timeRange === 'long'} onChange={() => handleTimeChange('long')} className="accent-purple-600" />
                            <span className={cn("text-sm", timeRange === 'long' ? "text-purple-700 font-medium" : "text-zinc-600")}>Largo (&gt; 60 min)</span>
                        </label>
                    </div>
                </div>

                {/* Sort */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <ArrowUpDown size={16} /> Ordenar por
                    </h3>
                    <select
                        value={sort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="newest">Más Recientes</option>
                        <option value="oldest">Más Antiguas</option>
                        <option value="fastest">Más Rápidas</option>
                    </select>
                </div>

                {/* Rating */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Star size={16} /> Valoración Mínima
                    </h3>
                    <div>
                        <StarRating
                            value={Number(searchParams.get('rating')) || 0}
                            onChange={(val) => {
                                const params = new URLSearchParams(searchParams.toString())
                                if (val === Number(searchParams.get('rating'))) params.delete('rating')
                                else params.set('rating', String(val))
                                router.push(`/?${params.toString()}`)
                            }}
                            size={24}
                        />
                        <p className="text-xs text-zinc-400 mt-2">
                            {Number(searchParams.get('rating')) > 0
                                ? `${searchParams.get('rating')} estrellas o más`
                                : 'Cualquier valoración'}
                        </p>
                    </div>
                </div>
            </div>

            {hasFilters && (
                <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                    <button
                        onClick={clearFilters}
                        className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
                    >
                        <X size={16} /> Limpiar Filtros
                    </button>
                </div>
            )}
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { searchImages, SearchResult } from '@/app/actions/image-search'
import { Search, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageSearchModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (url: string) => void
    initialQuery: string
}

export function ImageSearchModal({ isOpen, onClose, onSelect, initialQuery }: ImageSearchModalProps) {
    const [query, setQuery] = useState(initialQuery)
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    // Initial search when opened
    useEffect(() => {
        if (isOpen && initialQuery) {
            setQuery(initialQuery)
            handleSearch(initialQuery)
        }
    }, [isOpen, initialQuery])

    const handleSearch = async (q: string) => {
        if (!q.trim()) return
        setLoading(true)
        setSearched(true)
        try {
            const images = await searchImages(q)
            setResults(images)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] border border-zinc-200 dark:border-zinc-800">
                {/* Header */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                            placeholder="Buscar imágenes (ej. Tarta de Chocolate)..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-purple-500 outline-none"
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={() => handleSearch(query)}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        Buscar
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4">
                            <Loader2 size={40} className="animate-spin text-purple-600" />
                            <p>Buscando mejores imágenes...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {results.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelect(img.image)}
                                    className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 hover:ring-2 ring-purple-500 transition-all focus:outline-none"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img.thumbnail || img.image}
                                        alt={img.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs truncate">{img.title}</p>
                                        <p className="text-zinc-300 text-[10px] truncate">{new URL(img.source).hostname}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : searched ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
                            <ImageIcon size={48} className="opacity-20" />
                            <p>No se encontraron imágenes</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
                            <Search size={48} className="opacity-20" />
                            <p>Escribe algo para buscar</p>
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400">
                    Imágenes proporcionadas por DuckDuckGo
                </div>
            </div>
        </div>
    )
}

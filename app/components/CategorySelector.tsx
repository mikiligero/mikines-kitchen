'use client'

import { useState, useEffect } from 'react'
import { Check, X, Plus } from 'lucide-react'
import { getCategories } from '@/app/actions/recipes' // We'll assume this is exported now

interface CategorySelectorProps {
    selected: string[]
    onChange: (categories: string[]) => void
}

export function CategorySelector({ selected, onChange }: CategorySelectorProps) {
    const [available, setAvailable] = useState<{ id: string; name: string }[]>([])
    const [input, setInput] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        getCategories().then(setAvailable)
    }, [])

    const handleAdd = (name: string) => {
        const trimmed = name.trim()
        if (trimmed && !selected.includes(trimmed)) {
            onChange([...selected, trimmed])
        }
        setInput('')
    }

    const handleRemove = (name: string) => {
        onChange(selected.filter((c) => c !== name))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd(input)
        }
    }

    const filtered = available.filter(
        (c) =>
            !selected.includes(c.name) &&
            c.name.toLowerCase().includes(input.toLowerCase())
    )

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium">Categorías</label>

            <div className="flex flex-wrap gap-2 mb-2">
                {selected.map((cat) => (
                    <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-sm">
                        {cat}
                        <button type="button" onClick={() => handleRemove(cat)} className="hover:text-purple-900">
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>

            <div className="relative">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsOpen(true)}
                        // Use a slight delay on blur to allow clicking items
                        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                        placeholder="Seleccionar o crear categoría..."
                        className="flex-1 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                    />
                    <button
                        type="button"
                        onClick={() => handleAdd(input)}
                        disabled={!input.trim()}
                        className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Suggestions Dropdown */}
                {isOpen && (filtered.length > 0 || input.trim().length > 0) && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg max-h-48 overflow-auto">
                        {filtered.map((cat) => (
                            <button
                                type="button"
                                key={cat.id}
                                onClick={() => handleAdd(cat.name)}
                                className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between"
                            >
                                <span>{cat.name}</span>
                                {selected.includes(cat.name) && <Check size={16} />}
                            </button>
                        ))}

                        {input.trim() && !filtered.some(c => c.name.toLowerCase() === input.trim().toLowerCase()) && (
                            <button
                                type="button"
                                onClick={() => handleAdd(input)}
                                className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium border-t border-zinc-100 dark:border-zinc-800"
                            >
                                <Plus size={16} />
                                Crear &quot;{input}&quot;
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

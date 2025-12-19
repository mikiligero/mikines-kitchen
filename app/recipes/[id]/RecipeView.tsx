'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PortionScaler } from '@/app/components/PortionScaler'
import { DeleteRecipeButton } from '@/app/components/DeleteRecipeButton'
import { Clock, Calendar, Pencil, Globe, Type } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface RecipeViewProps {
    recipe: any // Using any for simplicity as I don't have the full type definition handy, but ideally should be RecipeWithRelations
}

export function RecipeView({ recipe }: RecipeViewProps) {
    const [textSize, setTextSize] = useState(0) // 0: Normal, 1: Large, 2: Huge

    const getTextClass = () => {
        switch (textSize) {
            case 1: return 'text-lg'
            case 2: return 'text-xl'
            case 3: return 'text-2xl'
            default: return 'text-base'
        }
    }

    const getProseClass = () => {
        switch (textSize) {
            case 1: return 'prose-lg'
            case 2: return 'prose-xl'
            case 3: return 'prose-2xl'
            default: return 'prose'
        }
    }

    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)

    return (
        <article className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex-1 text-center md:text-left">
                        {recipe.title}
                    </h1>
                </div>

                {recipe.description && (
                    <p className={`text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto md:mx-0 ${getTextClass()}`}>
                        {recipe.description}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-6 text-zinc-500 justify-center md:justify-start">
                    <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span>Total: {totalTime > 0 ? `${totalTime} min` : 'N/A'}</span>
                    </div>
                    {recipe.prepTime && (
                        <span className="text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">Prep: {recipe.prepTime}m</span>
                    )}
                    {recipe.cookTime && (
                        <span className="text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">Cook: {recipe.cookTime}m</span>
                    )}

                    <div className="flex items-center gap-4 text-sm ml-auto">
                        {/* Text Size Controls */}
                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 shrink-0">
                            <button
                                onClick={() => setTextSize(Math.max(0, textSize - 1))}
                                className={`p-2 rounded-md transition-colors ${textSize === 0 ? 'text-zinc-300' : 'hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200'}`}
                                disabled={textSize === 0}
                                title="Disminuir texto"
                            >
                                <span className="text-xs font-bold">A-</span>
                            </button>
                            <Type size={16} className="text-zinc-400" />
                            <button
                                onClick={() => setTextSize(Math.min(3, textSize + 1))}
                                className={`p-2 rounded-md transition-colors ${textSize === 3 ? 'text-zinc-300' : 'hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200'}`}
                                disabled={textSize === 3}
                                title="Aumentar texto"
                            >
                                <span className="text-lg font-bold">A+</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>hace {formatDistanceToNow(recipe.createdAt).replace('about', '')}</span>
                        </div>

                        <div className="flex items-center gap-2 ml-4 border-l pl-4 border-zinc-200 dark:border-zinc-800">
                            <Link href={`/recipes/${recipe.id}/edit`} className="p-2 text-zinc-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors" title="Editar Receta">
                                <Pencil size={20} />
                            </Link>
                            <DeleteRecipeButton id={recipe.id} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Image */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-xl relative">
                {recipe.imagePath ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={recipe.imagePath} alt={recipe.title} className="w-full h-full object-cover" />
                        {(recipe.imagePath.startsWith('http') || recipe.imagePath.startsWith('https')) && (
                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white z-10">
                                <Globe size={20} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <span className="text-6xl">🍳</span>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-[1fr_300px] gap-8">
                {/* Main Content */}
                <div className="space-y-8">

                    {/* Duplicate description removed here */}

                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 p-1.5 rounded-lg">📋</span>
                            Instrucciones
                        </h2>
                        <div className={`space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line ${getTextClass()}`}>
                            {recipe.instructions}
                        </div>
                    </div>

                    {recipe.notes && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 shadow-sm border border-amber-200 dark:border-amber-800/50">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-900 dark:text-amber-100">
                                <span className="text-amber-600 dark:text-amber-400 text-2xl">📝</span>
                                Notas del Chef
                            </h2>
                            <div className={`space-y-4 text-amber-900/80 dark:text-amber-100/80 leading-relaxed whitespace-pre-line overflow-hidden break-words ${getTextClass()}`}>
                                {recipe.notes}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Ingredients & Meta (Top on mobile, Right on Desktop) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 sticky top-4">
                        <div className="flex items-center gap-2 mb-6 text-zinc-500">
                            <Clock size={20} />
                            <div className="flex gap-4 text-sm">
                                <div>
                                    <span className="block font-bold text-zinc-900 dark:text-zinc-100">{recipe.prepTime || 0}m</span>
                                    Prep
                                </div>
                                <div>
                                    <span className="block font-bold text-zinc-900 dark:text-zinc-100">{recipe.cookTime || 0}m</span>
                                    Cocción
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <PortionScaler
                                initialServings={recipe.servings}
                                ingredients={recipe.ingredients}
                                className={getTextClass()}
                            />
                        </div>

                        {recipe.categories.length > 0 && (
                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-6">
                                <h3 className="font-bold mb-3 text-sm text-zinc-500 uppercase tracking-wider">Categorías</h3>
                                <div className="flex flex-wrap gap-2">
                                    {recipe.categories.map((cat: { id: string; name: string }) => (
                                        <span key={cat.id} className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                            {cat.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    )
}

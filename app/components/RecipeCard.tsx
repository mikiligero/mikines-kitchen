import Link from 'next/link'
import { Clock, Users, Globe } from 'lucide-react'
import { RecipeWithRelations } from '@/app/actions/recipes'
import { cn } from '@/lib/utils'
import { StarRating } from './StarRating'

interface RecipeCardProps {
    recipe: RecipeWithRelations
    variant?: 'grid-lg' | 'grid-md' | 'row' | 'list'
}

export function RecipeCard({ recipe, variant = 'grid-md' }: RecipeCardProps) {
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)

    const isGrid = variant.startsWith('grid')
    const isRow = variant === 'row'
    const isList = variant === 'list'

    const isExternal = recipe.imagePath?.startsWith('http') || recipe.imagePath?.startsWith('https')

    return (
        <Link
            href={`/recipes/${recipe.id}`}
            className={cn(
                "group bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow-md",
                isGrid ? "block" : "flex items-center"
            )}
        >
            <div className={cn(
                "bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden flex-shrink-0",
                isGrid ? "aspect-video w-full" : "",
                isRow ? "w-32 h-32" : "",
                isList ? "w-16 h-16 rounded-l-xl" : ""
            )}>
                {recipe.imagePath ? (
                    <>
                        {/* In a real app we'd use Image component, but for local MVP standard img is easier with dynamic paths */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={recipe.imagePath}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {isExternal && (
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white z-10">
                                <Globe size={14} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <span className={cn("text-4xl", isList && "text-2xl")}>🍳</span>
                    </div>
                )}
            </div>

            <div className={cn("p-4", isList && "p-3 flex-1 flex items-center justify-between")}>
                <div className={cn(isList && "flex-1")}>
                    <h3 className={cn(
                        "font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-purple-600 transition-colors",
                        isGrid || isRow ? "text-lg mb-2" : "text-base mb-1"
                    )}>
                        {recipe.title}
                    </h3>

                    <div className={cn("mb-2", isGrid || isRow ? "mb-3" : "mb-1")}>
                        <StarRating value={recipe.rating || 0} readOnly size={14} />
                    </div>

                    {(isGrid || isRow) && (
                        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                            {totalTime > 0 && (
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>{totalTime} min</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Users size={14} />
                                <span>{recipe.servings} p.</span>
                            </div>
                        </div>
                    )}
                </div>

                {isList && (
                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                        {totalTime > 0 && (
                            <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{totalTime}m</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Users size={12} />
                            <span>{recipe.servings}p</span>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    )
}

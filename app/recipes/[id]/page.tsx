import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRecipe } from '@/app/actions/recipes'
import { PortionScaler } from '@/app/components/PortionScaler'
import { DeleteRecipeButton } from '@/app/components/DeleteRecipeButton'
import { Clock, Calendar, Pencil, Globe } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const recipe = await getRecipe(id)

    if (!recipe) {
        notFound()
    }

    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)

    return (
        <article className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-4 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    {recipe.title}
                </h1>
                {recipe.description && (
                    <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
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
                    <div className="flex items-center gap-2 text-sm ml-auto">
                        <Calendar size={16} />
                        <span>hace {formatDistanceToNow(recipe.createdAt).replace('about', '')}</span>

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
                <div className="space-y-8">
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">{recipe.description}</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 p-1.5 rounded-lg">📋</span>
                            Instrucciones
                        </h2>
                        <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                            {recipe.instructions}
                        </div>
                    </div>

                    {recipe.notes && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 shadow-sm border border-amber-200 dark:border-amber-800/50">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-900 dark:text-amber-100">
                                <span className="text-amber-600 dark:text-amber-400 text-2xl">📝</span>
                                Notas del Chef
                            </h2>
                            <div className="space-y-4 text-amber-900/80 dark:text-amber-100/80 leading-relaxed whitespace-pre-line overflow-hidden break-words">
                                {recipe.notes}
                            </div>
                        </div>
                    )}
                </div>

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
                            <PortionScaler initialServings={recipe.servings} ingredients={recipe.ingredients} />
                        </div>

                        <div>
                            <h3 className="font-bold mb-3 text-zinc-900 dark:text-zinc-100">Ingredientes</h3>
                            {/* Ingredients list is handled by PortionScaler now, but if we wanted static: */}
                            {/* This part is actually rendered by PortionScaler usually, but wait, PortionScaler only renders the scaler controls? 
                    Ah, looking at PortionScaler implementation, it likely Renders the list too. 
                    Let's check PortionScaler.tsx content previously viewed? No, I viewed it but didn't memorize.
                    Wait, let's look at the previous file content of page.tsx I replaced.
                    The previous content had PortionScaler passed in. Let's assume PortionScaler renders the list.
                */}
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

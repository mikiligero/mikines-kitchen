import { Suspense } from 'react'
import { getRecipes, getCategories } from './actions/recipes'
import { RecipeCard } from './components/RecipeCard'
import { SearchBar } from './components/SearchBar'
import { FilterPanel } from './components/FilterPanel'
import { FilterTrigger } from './components/FilterTrigger'
import { FilterProvider } from './components/FilterContext'
import { ViewToggle, ViewMode } from './components/ViewToggle'
import { Utensils } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string, category?: string, time?: string, sort?: string, view?: string, rating?: string }> }) {
  const { q, category, time, sort, view, rating } = await searchParams
  const recipes = await getRecipes({ query: q, category, time, sort, rating })
  const categories = await getCategories()

  const currentView = (view as ViewMode) || 'grid-md'

  const getListClass = () => {
    switch (currentView) {
      case 'grid-lg': return 'grid grid-cols-1 md:grid-cols-2 gap-6'
      case 'grid-md': return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
      case 'rows-grid': return 'grid grid-cols-1 lg:grid-cols-2 gap-6'
      case 'row': return 'flex flex-col gap-4'
      case 'list': return 'flex flex-col gap-3'
      default: return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
    }
  }

  return (
    <FilterProvider>
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Todas las Recetas</h1>
          <div className="w-full md:w-auto flex items-start gap-2">
            <FilterTrigger />
            <div className="flex-1 md:w-64">
              <Suspense>
                <SearchBar />
              </Suspense>
              <p className="text-zinc-500 text-xs mt-1 text-right">{recipes.length} recetas encontradas</p>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <Suspense>
            <ViewToggle />
          </Suspense>
        </div>

        <Suspense>
          <FilterPanel categories={categories} />
        </Suspense>

        {recipes.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="inline-flex p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4 text-zinc-400">
              <Utensils size={32} />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No se encontraron recetas</h3>
            <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
              {q || category || time ? "Intenta ajustar tus filtros de búsqueda." : "¡Empieza añadiendo tu primera receta!"}
            </p>
          </div>
        ) : (
          <div className={getListClass()}>
            {recipes.map((recipe: import('@/app/actions/recipes').RecipeWithRelations) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                variant={currentView === 'rows-grid' ? 'row' : currentView}
              />
            ))}
          </div>
        )}
      </div>
    </FilterProvider>
  )
}

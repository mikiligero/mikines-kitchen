import { notFound } from 'next/navigation'
import { getRecipe } from '@/app/actions/recipes'
import { RecipeView } from './RecipeView'

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const recipe = await getRecipe(id)

    if (!recipe) {
        notFound()
    }

    return <RecipeView recipe={recipe} />
}

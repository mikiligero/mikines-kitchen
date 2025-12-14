import { notFound } from 'next/navigation'
import { getRecipe } from '@/app/actions/recipes'
import { RecipeForm } from '@/app/components/RecipeForm'

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const recipe = await getRecipe(id)

    if (!recipe) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto">
            <RecipeForm initialData={recipe} />
        </div>
    )
}

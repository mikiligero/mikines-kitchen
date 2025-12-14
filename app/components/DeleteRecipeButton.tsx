'use client'

import { deleteRecipe } from '@/app/actions/recipes'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function DeleteRecipeButton({ id }: { id: string }) {
    const router = useRouter()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (confirm("¿Estás seguro de que quieres borrar esta receta?")) {
            startTransition(async () => {
                await deleteRecipe(id)
                router.push('/')
            })
        }
    }

    return (
        <button
            onClick={handleDelete}
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete Recipe"
        >
            <Trash2 size={20} />
        </button>
    )
}

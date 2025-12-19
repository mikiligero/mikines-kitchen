'use client'

import { useState } from 'react'
import { Users, Minus, Plus } from 'lucide-react'
import { Ingredient } from '@prisma/client'

interface PortionScalerProps {
    initialServings: number
    ingredients: Ingredient[]
    className?: string
}

export function PortionScaler({ initialServings, ingredients, className }: PortionScalerProps) {
    const [servings, setServings] = useState(initialServings)

    const scale = (amount: number) => {
        if (!amount) return 0
        const scaled = (amount / initialServings) * servings
        // Format to avoiding long decimals: round to 2 decimals
        return Math.round(scaled * 100) / 100
    }

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Ingred.</h3>

                <div className="flex items-center gap-3 bg-white dark:bg-black rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-1">
                    <Users size={16} className="text-zinc-500" />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setServings(Math.max(1, servings - 1))}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="font-medium min-w-[3ch] text-center">{servings}</span>
                        <button
                            onClick={() => setServings(servings + 1)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <ul className={`space-y-3 ${className}`}>
                {ingredients.map((ing) => (
                    <li key={ing.id} className="flex items-start justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {ing.name}
                        </span>
                        <span className="text-purple-600 font-semibold whitespace-nowrap ml-4">
                            {ing.amount > 0 ? scale(ing.amount) : ''} {ing.unit}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

